const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  type: { type: String, enum: ['mcq', 'short-answer', 'essay', 'file-upload'], required: true },
  question: { type: String, required: true },
  description: String,
  points: { type: Number, default: 10, min: 1 },
  order: { type: Number, default: 0 },
  // For MCQ
  options: [
    {
      text: String,
      isCorrect: Boolean
    }
  ],
  // For all types: optional rubric/hints
  rubric: String,
  hints: [String],
  createdAt: { type: Date, default: Date.now }
});

const AssignmentSchema = new mongoose.Schema({
  section: { type: mongoose.Schema.Types.ObjectId, ref: 'Section', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: String,
  instructions: String,
  dueDate: Date,
  totalPoints: { type: Number, default: 100 },
  questions: [QuestionSchema],
  passingScore: { type: Number, default: 60 },
  allowLateSubmission: { type: Boolean, default: false },
  latePenalty: { type: Number, default: 10 }, // percentage
  isPublished: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Assignment', AssignmentSchema);
