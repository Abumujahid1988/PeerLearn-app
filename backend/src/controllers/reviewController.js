// Controller for course and lesson reviews
const Course = require('../models/Course');
const Lesson = require('../models/Lesson');
const Enrollment = require('../models/Enrollment');

// Add or update a review for a course
exports.addCourseReview = async (req, res) => {
  try {
    const { id } = req.params; // course id
    const { rating, comment } = req.body;
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }
    const course = await Course.findById(id);
    if (!course) return res.status(404).json({ error: 'Course not found' });
    // Only enrolled students can review
    const isEnrolled = course.enrolledStudents.some(s => String(s) === String(req.user._id));
    if (!isEnrolled) return res.status(403).json({ error: 'Only enrolled students can review' });
    // Only one review per user
    const existing = course.reviews.find(r => String(r.student) === String(req.user._id));
    if (existing) {
      existing.rating = rating;
      existing.comment = comment;
      existing.createdAt = new Date();
    } else {
      course.reviews.push({ student: req.user._id, rating, comment });
    }
    // Update average rating
    course.rating = course.reviews.length ? (course.reviews.reduce((sum, r) => sum + r.rating, 0) / course.reviews.length) : 0;
    await course.save();
    res.json({ success: true, reviews: course.reviews, rating: course.rating });
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

// Get all reviews for a course
exports.getCourseReviews = async (req, res) => {
  try {
    const { id } = req.params;
    const course = await Course.findById(id).populate('reviews.student', 'name email');
    if (!course) return res.status(404).json({ error: 'Course not found' });
    res.json({ reviews: course.reviews, rating: course.rating });
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

// Add or update a review for a lesson
exports.addLessonReview = async (req, res) => {
  try {
    const { id } = req.params; // lesson id
    const { rating, comment } = req.body;
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }
    const lesson = await Lesson.findById(id);
    if (!lesson) return res.status(404).json({ error: 'Lesson not found' });
    // Only enrolled students can review (check via course)
    const course = await Course.findById(lesson.course);
    const isEnrolled = course && course.enrolledStudents.some(s => String(s) === String(req.user._id));
    if (!isEnrolled) return res.status(403).json({ error: 'Only enrolled students can review' });
    // Only one review per user
    const existing = lesson.reviews.find(r => String(r.student) === String(req.user._id));
    if (existing) {
      existing.rating = rating;
      existing.comment = comment;
      existing.createdAt = new Date();
    } else {
      lesson.reviews.push({ student: req.user._id, rating, comment });
    }
    // Update average rating
    lesson.rating = lesson.reviews.length ? (lesson.reviews.reduce((sum, r) => sum + r.rating, 0) / lesson.reviews.length) : 0;
    await lesson.save();
    res.json({ success: true, reviews: lesson.reviews, rating: lesson.rating });
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

// Get all reviews for a lesson
exports.getLessonReviews = async (req, res) => {
  try {
    const { id } = req.params;
    const lesson = await Lesson.findById(id).populate('reviews.student', 'name email');
    if (!lesson) return res.status(404).json({ error: 'Lesson not found' });
    res.json({ reviews: lesson.reviews, rating: lesson.rating });
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};
