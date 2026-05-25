const express = require('express');
const router = express.Router();
const { updateProfile, getStudentDashboard } = require('../controllers/mainController');
const { protect } = require('../middleware/authMiddleware');
const { uploadImage } = require('../config/cloudinary');

router.put('/profile', protect, uploadImage.single('avatar'), updateProfile);
router.get('/dashboard', protect, getStudentDashboard);

module.exports = router;
