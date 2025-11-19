const mongoose = require('mongoose');

const EnrollmentSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  enrolledAt: { type: Date, default: Date.now },
  completionStatus: { type: String, enum: ['active', 'completed', 'dropped'], default: 'active' },
  progressPercentage: { type: Number, default: 0, min: 0, max: 100 },
  completedLessons: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' }],
  lastAccessedAt: Date,
  certificateEarned: { type: Boolean, default: false },
  certificateUrl: String
}, { timestamps: true });

// Ensure unique enrollment (one student can't enroll twice)
EnrollmentSchema.index({ student: 1, course: 1 }, { unique: true });

module.exports = mongoose.model('Enrollment', EnrollmentSchema);
