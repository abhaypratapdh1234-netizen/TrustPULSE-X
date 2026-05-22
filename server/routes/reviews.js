const express = require('express');
const router = express.Router();
const { getReviews, createReview, markHelpful, reportReview } = require('../controllers/reviewController');
const { protect, optionalAuth } = require('../middleware/auth');

router.get('/:companySlug', getReviews);
router.post('/', optionalAuth, createReview);
router.post('/:id/helpful', markHelpful);
router.post('/:id/report', reportReview);

module.exports = router;
