const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const reviewController = require('../controllers/reviewController');

// Course reviews
router.post('/courses/:id/reviews', auth, reviewController.addCourseReview);
router.get('/courses/:id/reviews', reviewController.getCourseReviews);

// Lesson reviews
router.post('/lessons/:id/reviews', auth, reviewController.addLessonReview);
router.get('/lessons/:id/reviews', reviewController.getLessonReviews);

module.exports = router;
