const User = require('../models/User');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');

// Platform-wide stats for admin dashboard
exports.getPlatformStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalCourses = await Course.countDocuments();
    const totalEnrollments = await Enrollment.countDocuments();
    const totalInstructors = await User.countDocuments({ role: 'instructor' });
    const totalStudents = await User.countDocuments({ role: 'student' });
    res.json({
      totalUsers,
      totalCourses,
      totalEnrollments,
      totalInstructors,
      totalStudents
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

// Promote/demote user role
exports.setUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    if (!['student','instructor','admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    user.role = role;
    await user.save();
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};


// Create user (admin only)
const bcrypt = require('bcryptjs');
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if(!name || !email || !password) return res.status(400).json({ error: 'Missing fields' });
    const exists = await User.findOne({ email });
    if(exists) return res.status(400).json({ error: 'User exists' });
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed, role });
    res.json({ _id: user._id, name: user.name, email: user.email, role: user.role });
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
};

// Remove user
exports.removeUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    // Remove enrollments
    const Enrollment = require('../models/Enrollment');
    await Enrollment.deleteMany({ student: user._id });
    // Remove authored courses (if instructor)
    const Course = require('../models/Course');
    const authoredCourses = await Course.find({ instructor: user._id });
    for (const course of authoredCourses) {
      await Course.deleteOne({ _id: course._id });
    }
    await User.deleteOne({ _id: user._id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};
