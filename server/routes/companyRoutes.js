const express = require('express');
const router = express.Router();
const { getCompany, getTrending, compareCompanies, searchCompanies } = require('../controllers/companyController');
const { optionalAuth } = require('../middleware/authMiddleware');

router.get('/trending', getTrending);
router.get('/search', searchCompanies);
router.post('/compare', compareCompanies);
router.get('/:name', optionalAuth, getCompany);

module.exports = router;
