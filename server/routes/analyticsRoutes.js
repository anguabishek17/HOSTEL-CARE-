const express = require('express');
const router = express.Router();
const { getOverview, getCategories, getRecent } = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');

// Explicitly restricted to ONLY 'official' as per specification
router.get('/overview', protect(['official']), getOverview);
router.get('/categories', protect(['official']), getCategories);
router.get('/recent', protect(['official']), getRecent);

module.exports = router;
