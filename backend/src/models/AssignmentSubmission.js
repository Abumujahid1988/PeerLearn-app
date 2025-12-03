const mongoose = require('mongoose');

const AnswerSchema = new mongoose.Schema({
  questionId: { type: mongoose.Schema.Types.ObjectId, required: true },
  questionType: String,
  answer: mongoose.Schema.Types.Mixed, // Can be string (short/essay), number (for mcq), object (file-upload)
  isCorrect: Boolean, // For auto-graded questions (MCQ)
  pointsEarned: { type: Number, default: 0 },
  feedback: String,
  gradedAt: Date,
  gradedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

const AssignmentSubmissionSchema = new mongoose.Schema({
  assignment: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment', required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  answers: [AnswerSchema],
  totalPointsEarned: { type: Number, default: 0 },
  maxPoints: { type: Number, required: true },
  scorePercentage: { type: Number, default: 0 },
  status: { type: String, enum: ['draft', 'submitted', 'graded', 'resubmitted'], default: 'draft' },
  feedback: String,
  isLateSubmission: { type: Boolean, default: false },
  submittedAt: Date,
  gradedAt: Date,
  gradedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Index for quick lookups
AssignmentSubmissionSchema.index({ assignment: 1, student: 1 }, { unique: true });
AssignmentSubmissionSchema.index({ course: 1, status: 1 });

module.exports = mongoose.model('AssignmentSubmission', AssignmentSubmissionSchema);
