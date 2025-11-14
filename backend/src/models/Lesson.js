const mongoose = require('mongoose');

const LessonSchema = new mongoose.Schema({
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  title: { type: String, required: true },
  content: String,
  order: Number,
  duration: Number
}, { timestamps: true });

module.exports = mongoose.model('Lesson', LessonSchema);
