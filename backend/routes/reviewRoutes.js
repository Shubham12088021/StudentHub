// reviewRoutes.js
const express = require('express');
const router = express.Router({ mergeParams: true });
const { getReviews, createReview, updateReview, deleteReview } = require('../controllers/mainController');
const { protect } = require('../middleware/authMiddleware');

router.get('/:courseId/reviews', getReviews);
router.post('/:courseId/reviews', protect, createReview);
router.put('/reviews/:id', protect, updateReview);
router.delete('/reviews/:id', protect, deleteReview);

module.exports = router;
