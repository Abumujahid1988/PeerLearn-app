const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');

exports.list = async (req, res) => {
  // admins or instructors may want to view enrollments
  const enrollments = await Enrollment.find().populate('student', 'name email').populate('course', 'title');
  res.json(enrollments);
};

exports.get = async (req, res) => {
  const enrollment = await Enrollment.findById(req.params.id).populate('student', 'name email').populate('course', 'title');
  if(!enrollment) return res.status(404).json({ error: 'Not found' });
  res.json(enrollment);
};

exports.unenroll = async (req, res) => {
  const enrollment = await Enrollment.findById(req.params.id);
  if(!enrollment) return res.status(404).json({ error: 'Not found' });
  if(String(enrollment.student) !== String(req.user._id) && req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  // remove student from course.enrolledStudents
  const course = await Course.findById(enrollment.course);
  if(course) {
    course.enrolledStudents = course.enrolledStudents.filter(s => String(s) !== String(enrollment.student));
    await course.save();
  }
  await enrollment.remove();
  res.json({ success: true });
};
