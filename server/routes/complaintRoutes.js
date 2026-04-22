const express = require('express');
const router = express.Router();
const { 
    createComplaint, 
    getComplaints, 
    updateStatus, 
    assignStaff,
    getStaff
} = require('../controllers/complaintsController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/staff', protect(['warden', 'official']), getStaff);
// multer handles multipart/form-data; single image field named "image"
router.post('/', protect(['student']), upload.single('image'), createComplaint);
router.get('/', protect(), getComplaints);
router.put('/:id/status', protect(['staff', 'warden', 'official']), updateStatus);
router.put('/:id/assign', protect(['warden', 'official']), assignStaff);

module.exports = router;
