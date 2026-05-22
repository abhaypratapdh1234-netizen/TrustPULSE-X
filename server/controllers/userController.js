const User = require('../models/User');
const Company = require('../models/Company');
const Notification = require('../models/Notification');
const Watchlist = require('../models/Watchlist');

// @desc    Get user profile
// @route   GET /api/users/profile
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('favorites', 'name slug logo ratings.overall trustScore industry')
      .populate('watchlist', 'name slug logo ratings.overall trustScore trendDirection');

    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// @desc    Update profile
// @route   PUT /api/users/profile
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, avatar, theme, language, notificationPreferences } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (avatar) updates.avatar = avatar;
    if (theme) updates.theme = theme;
    if (language) updates.language = language;
    if (notificationPreferences) updates.notificationPreferences = notificationPreferences;

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle favorite company
// @route   POST /api/users/favorites/:companyId
exports.toggleFavorite = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const { companyId } = req.params;

    const exists = user.favorites.includes(companyId);
    if (exists) {
      user.favorites = user.favorites.filter((id) => id.toString() !== companyId);
    } else {
      if (user.favorites.length >= 50) {
        return res.status(400).json({ success: false, message: 'Favorites limit reached (50).' });
      }
      user.favorites.push(companyId);
    }

    await user.save();
    res.json({ success: true, isFavorite: !exists, favorites: user.favorites });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user watchlist
// @route   GET /api/users/watchlist
exports.getWatchlist = async (req, res, next) => {
  try {
    const watchlist = await Watchlist.findOne({ user: req.user._id })
      .populate('companies.company', 'name slug logo ratings.overall trustScore trendDirection weeklyGrowth');

    res.json({ success: true, data: watchlist?.companies || [] });
  } catch (error) {
    next(error);
  }
};

// @desc    Add/remove from watchlist
// @route   POST /api/users/watchlist/:companyId
exports.toggleWatchlist = async (req, res, next) => {
  try {
    const { companyId } = req.params;
    let watchlist = await Watchlist.findOne({ user: req.user._id });

    if (!watchlist) {
      watchlist = await Watchlist.create({ user: req.user._id, companies: [] });
    }

    const existingIdx = watchlist.companies.findIndex(
      (item) => item.company.toString() === companyId
    );

    let added = false;
    if (existingIdx >= 0) {
      watchlist.companies.splice(existingIdx, 1);
    } else {
      const company = await Company.findById(companyId);
      watchlist.companies.push({
        company: companyId,
        lastTrustScore: company?.trustScore || 0,
        lastRating: company?.ratings?.overall || 0,
      });
      added = true;
    }

    await watchlist.save();
    res.json({ success: true, inWatchlist: added });
  } catch (error) {
    next(error);
  }
};

// @desc    Get notifications
// @route   GET /api/users/notifications
exports.getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate('company', 'name slug logo');

    const unreadCount = await Notification.countDocuments({ user: req.user._id, isRead: false });

    res.json({ success: true, data: notifications, unreadCount });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark notifications as read
// @route   PUT /api/users/notifications/read
exports.markNotificationsRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true });
    res.json({ success: true, message: 'All notifications marked as read.' });
  } catch (error) {
    next(error);
  }
};
