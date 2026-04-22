const express = require('express');
const router = express.Router();
const multer = require('multer');
const { getStudents, addStudent, uploadCSV, deleteStudent } = require('../controllers/studentController');
const { protect } = require('../middleware/authMiddleware');

// CSV goes to memory (no file on disk needed for parsing)
const csvUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

router.get('/',              protect(['warden', 'official']), getStudents);
router.post('/',             protect(['warden']),             addStudent);
router.post('/upload',       protect(['warden']),             csvUpload.single('csv'), uploadCSV);
router.delete('/:id',        protect(['warden']),             deleteStudent);

module.exports = router;
