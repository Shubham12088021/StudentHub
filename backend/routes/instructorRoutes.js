const express = require('express');
const router = express.Router();
const { getInstructorDashboard } = require('../controllers/mainController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect, authorize('instructor', 'admin'));
router.get('/dashboard', getInstructorDashboard);

module.exports = router;
