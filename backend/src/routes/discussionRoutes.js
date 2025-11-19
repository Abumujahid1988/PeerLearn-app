const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { listByCourse, createThread, getThread, addComment, deleteThread, deleteComment } = require('../controllers/discussionController');

// threads for a course
router.get('/course/:courseId', listByCourse);
router.post('/course/:courseId', auth, createThread);

// single thread
router.get('/:id', getThread);
router.post('/:id/comments', auth, addComment);
router.delete('/:id', auth, deleteThread);
router.delete('/:id/comments/:commentId', auth, deleteComment);

module.exports = router;
