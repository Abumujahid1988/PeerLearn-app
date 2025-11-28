const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category: { type: String, default: 'General' },
  difficulty: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' },
  tags: [String],
  thumbnail: String,
  price: { type: Number, default: 0 },
  isPaid: { type: Boolean, default: false },
  enrolledStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  sections: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Section' }],
  rating: { type: Number, default: 0, min: 0, max: 5 },
  // resourceLinks placed after rating as requested
  resourceLinks: [
    {
      label: { type: String, required: true },
      url: { type: String, required: true },
      type: { type: String, enum: ['pdf', 'video', 'audio', 'link'], default: 'link' }
    }
  ],
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

module.exports = mongoose.model('Course', CourseSchema);
