const mongoose = require('mongoose');

const LessonSchema = new mongoose.Schema({
  section: { type: mongoose.Schema.Types.ObjectId, ref: 'Section', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  title: { type: String, required: true },
  description: String,
  content: String,
  videoUrl: String,
  attachments: [
    {
      name: String,
      url: String,
      type: { type: String, enum: ['pdf', 'image', 'video', 'document', 'other'] },
      uploadedAt: { type: Date, default: Date.now }
    }
  ],
  order: { type: Number, default: 0 },
  duration: { type: Number, default: 0 },
  completedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  rating: { type: Number, default: 0, min: 0, max: 5 },
  reviews: [
    {
      student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      rating: Number,
      comment: String,
      createdAt: { type: Date, default: Date.now }
    }
  ],
  isPublished: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Lesson', LessonSchema);
