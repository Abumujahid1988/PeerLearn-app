const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  category: String,
  instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  lessons: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' }],
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  published: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Course', CourseSchema);
