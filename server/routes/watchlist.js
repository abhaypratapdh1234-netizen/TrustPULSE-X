const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Company = require('../models/Company');
const { protect } = require('../middleware/auth');

// All watchlist routes require authentication
router.use(protect);

// @desc    Get user watchlist names
// @route   GET /api/watchlist
router.get('/', async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('watchlist', 'name');
    const names = user.watchlist ? user.watchlist.map(c => c.name) : [];
    res.json({ success: true, data: names });
  } catch (error) {
    next(error);
  }
});

// @desc    Add company to watchlist by name
// @route   POST /api/watchlist/add
router.post('/add', async (req, res, next) => {
  try {
    const { companyName } = req.body;
    if (!companyName) {
      return res.status(400).json({ success: false, message: 'Company name is required' });
    }

    const company = await Company.findOne({ name: { $regex: new RegExp("^" + companyName + "$", "i") } });
    if (!company) {
      return res.status(404).json({ success: false, message: `Company '${companyName}' not found` });
    }

    const user = await User.findById(req.user._id);
    if (!user.watchlist) {
      user.watchlist = [];
    }

    if (!user.watchlist.includes(company._id)) {
      user.watchlist.push(company._id);
      await user.save();
    }

    await user.populate('watchlist', 'name');
    const names = user.watchlist ? user.watchlist.map(c => c.name) : [];
    res.json({ success: true, data: names });
  } catch (error) {
    next(error);
  }
});

// @desc    Remove company from watchlist by name
// @route   DELETE /api/watchlist/remove
router.delete('/remove', async (req, res, next) => {
  try {
    const { companyName } = req.body;
    if (!companyName) {
      return res.status(400).json({ success: false, message: 'Company name is required' });
    }

    const company = await Company.findOne({ name: { $regex: new RegExp("^" + companyName + "$", "i") } });
    const user = await User.findById(req.user._id);

    if (company && user.watchlist) {
      user.watchlist = user.watchlist.filter(id => id.toString() !== company._id.toString());
      await user.save();
    }

    await user.populate('watchlist', 'name');
    const names = user.watchlist ? user.watchlist.map(c => c.name) : [];
    res.json({ success: true, data: names });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
