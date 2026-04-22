const express = require('express');
const router = express.Router();
const { getMonthlyReport, exportAllCSV } = require('../controllers/reportsController');
const { protect } = require('../middleware/authMiddleware');

// Only Official and Warden roles can generate reports
router.get('/monthly', protect(['official', 'warden']), getMonthlyReport);
router.get('/export', protect(['official', 'warden']), exportAllCSV);

module.exports = router;
