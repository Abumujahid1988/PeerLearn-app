// Analytics controller for instructor dashboards
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const Lesson = require('../models/Lesson');

// Get analytics for all courses by instructor
exports.getInstructorAnalytics = async (req, res) => {
  try {
    const instructorId = req.user._id;
    // Find all courses by this instructor
    const courses = await Course.find({ instructor: instructorId });
    const analytics = [];
    for (const course of courses) {
      // Enrollment count
      const enrollmentCount = course.enrolledStudents.length;
      // Completion rate: students who completed all lessons
      let completionRate = 0;
      const lessons = await Lesson.find({ course: course._id });
      if (lessons.length > 0 && enrollmentCount > 0) {
        // For each student, check if they completed all lessons
        let completedAll = 0;
        for (const studentId of course.enrolledStudents) {
          const allCompleted = lessons.every(lesson => lesson.completedBy.includes(studentId));
          if (allCompleted) completedAll++;
        }
        completionRate = Math.round((completedAll / enrollmentCount) * 100);
      }
      // Average rating
      const avgRating = course.rating || 0;
      analytics.push({
        courseId: course._id,
        title: course.title,
        enrollmentCount,
        completionRate,
        avgRating,
      });
    }
    res.json({ analytics });
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};
