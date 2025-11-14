const mongoose = require('mongoose');

const ProgressSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  completedLessons: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' }],
  percentage: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Progress', ProgressSchema);
