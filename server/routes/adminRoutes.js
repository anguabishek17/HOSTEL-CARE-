const express = require('express');
const router = express.Router();
const { getStats } = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');

router.get('/stats', protect(['warden', 'official']), getStats);

module.exports = router;
