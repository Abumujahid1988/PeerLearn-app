const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { getInstructorAnalytics } = require('../controllers/analyticsController');

// Only instructors and admins can access their analytics
router.get('/instructor', auth, getInstructorAnalytics);

module.exports = router;
