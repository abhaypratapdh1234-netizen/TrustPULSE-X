const User = require('../models/User');

// @route POST /api/watchlist/add
const addToWatchlist = async (req, res, next) => {
  try {
    const { companyName } = req.body;
    if (!companyName) return res.status(400).json({ success: false, message: 'Company name required' });

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $addToSet: { watchlist: companyName } },
      { new: true }
    );
    res.json({ success: true, data: user.watchlist });
  } catch (error) {
    next(error);
  }
};

// @route DELETE /api/watchlist/remove
const removeFromWatchlist = async (req, res, next) => {
  try {
    const { companyName } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $pull: { watchlist: companyName } },
      { new: true }
    );
    res.json({ success: true, data: user.watchlist });
  } catch (error) {
    next(error);
  }
};

// @route GET /api/watchlist
const getWatchlist = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('watchlist');
    res.json({ success: true, data: user.watchlist });
  } catch (error) {
    next(error);
  }
};

module.exports = { addToWatchlist, removeFromWatchlist, getWatchlist };
