// lectureRoutes.js
const express = require('express');
const router = express.Router();
const { addLecture, getLecture, updateLecture, deleteLecture, addResource } = require('../controllers/lectureController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { uploadVideo, uploadDocument } = require('../config/cloudinary');

router.get('/:id', protect, getLecture);
router.post('/:courseId/section/:sectionIndex', protect, authorize('instructor', 'admin'), uploadVideo.single('video'), addLecture);
router.put('/:id', protect, authorize('instructor', 'admin'), uploadVideo.single('video'), updateLecture);
router.delete('/:id', protect, authorize('instructor', 'admin'), deleteLecture);
router.post('/:id/resources', protect, authorize('instructor', 'admin'), uploadDocument.single('file'), addResource);

module.exports = router;
