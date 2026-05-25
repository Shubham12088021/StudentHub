const express = require('express');
const router = express.Router();
const { getProgress, updateProgress, addNote, addBookmark } = require('../controllers/mainController');
const { protect } = require('../middleware/authMiddleware');

router.get('/:courseId', protect, getProgress);
router.put('/:courseId', protect, updateProgress);
router.post('/:courseId/notes', protect, addNote);
router.post('/:courseId/bookmarks', protect, addBookmark);

module.exports = router;
