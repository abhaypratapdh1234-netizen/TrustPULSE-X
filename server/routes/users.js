const express = require('express');
const router = express.Router();
const {
  getProfile, updateProfile, toggleFavorite, getWatchlist,
  toggleWatchlist, getNotifications, markNotificationsRead,
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');

router.use(protect); // All user routes require auth

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.post('/favorites/:companyId', toggleFavorite);
router.get('/watchlist', getWatchlist);
router.post('/watchlist/:companyId', toggleWatchlist);
router.get('/notifications', getNotifications);
router.put('/notifications/read', markNotificationsRead);

module.exports = router;
