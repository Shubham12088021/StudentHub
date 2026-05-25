const express = require('express');
const router = express.Router();
const { register, login, getMe, forgotPassword, resetPassword, updatePassword } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { registerValidator, loginValidator } = require('../middleware/validateMiddleware');
const { authRateLimit } = require('../middleware/rateLimitMiddleware');

router.post('/register', authRateLimit, registerValidator, register);
router.post('/login', authRateLimit, loginValidator, login);
router.get('/me', protect, getMe);
router.post('/forgot-password', authRateLimit, forgotPassword);
router.put('/reset-password/:token', resetPassword);
router.put('/update-password', protect, updatePassword);

module.exports = router;
