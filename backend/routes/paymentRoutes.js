const express = require('express');
const router = express.Router();
const { createRazorpayOrder, verifyPayment, enrollFree, getOrders, getOrder } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

router.post('/create-order', protect, createRazorpayOrder);
router.post('/verify', protect, verifyPayment);
router.post('/enroll-free', protect, enrollFree);
router.get('/orders', protect, getOrders);
router.get('/orders/:id', protect, getOrder);

module.exports = router;
