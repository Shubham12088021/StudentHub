const express = require('express');
const router = express.Router();
const {
  getAdminDashboard, getAllUsers, toggleUserStatus,
  approveCourse, approveInstructor, getPendingCourses,
} = require('../controllers/mainController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect, authorize('admin'));

router.get('/dashboard', getAdminDashboard);
router.get('/users', getAllUsers);
router.put('/users/:id/toggle-status', toggleUserStatus);
router.put('/users/:id/approve-instructor', approveInstructor);
router.get('/courses/pending', getPendingCourses);
router.put('/courses/:id/approve', approveCourse);

module.exports = router;
