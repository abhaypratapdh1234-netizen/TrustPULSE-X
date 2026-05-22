const express = require('express');
const router = express.Router();
const { getDashboardStats, getChartData, getIndustryAnalytics } = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');

router.get('/stats', getDashboardStats);
router.get('/charts/:companySlug', getChartData);
router.get('/industry', getIndustryAnalytics);

module.exports = router;
