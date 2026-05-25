const express = require('express');
const router = express.Router();
const { getWishlist, toggleWishlist } = require('../controllers/mainController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getWishlist);
router.post('/toggle', protect, toggleWishlist);

module.exports = router;
