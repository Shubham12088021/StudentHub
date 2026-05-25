const express = require('express');
const router = express.Router();
const {
  getCourses, getCourse, createCourse, updateCourse, deleteCourse,
  addSection, getInstructorCourses, togglePublish, getFeaturedCourses,
} = require('../controllers/courseController');
const { protect, authorize, requireApproved } = require('../middleware/authMiddleware');
const { uploadImage } = require('../config/cloudinary');

router.get('/', getCourses);
router.get('/featured', getFeaturedCourses);
router.get('/instructor/my-courses', protect, authorize('instructor', 'admin'), getInstructorCourses);
router.get('/:id', getCourse);
router.post('/', protect, authorize('instructor', 'admin'), requireApproved, uploadImage.single('thumbnail'), createCourse);
router.put('/:id', protect, authorize('instructor', 'admin'), uploadImage.single('thumbnail'), updateCourse);
router.delete('/:id', protect, authorize('instructor', 'admin'), deleteCourse);
router.post('/:id/sections', protect, authorize('instructor', 'admin'), addSection);
router.put('/:id/publish', protect, authorize('instructor'), togglePublish);

module.exports = router;
