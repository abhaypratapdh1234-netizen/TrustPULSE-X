const express = require('express');
const router = express.Router();
const {
  searchCompanies, getTrending, getTopRated, getLowestRated,
  getCompany, compareCompanies, getCompanyAnalytics,
  getAIInsights, chatbot, getRecommendations,
} = require('../controllers/companyController');
const { optionalAuth } = require('../middleware/auth');
const { searchLimiter } = require('../middleware/rateLimiter');

router.get('/search', searchLimiter, optionalAuth, searchCompanies);
router.get('/trending', getTrending);
router.get('/top-rated', getTopRated);
router.get('/lowest-rated', getLowestRated);
router.route('/compare')
  .get(compareCompanies)
  .post(compareCompanies);
router.get('/recommendations', optionalAuth, getRecommendations);
router.post('/chatbot', chatbot);
router.get('/:slug', getCompany);
router.get('/:slug/analytics', getCompanyAnalytics);
router.get('/:slug/insights', getAIInsights);

module.exports = router;
