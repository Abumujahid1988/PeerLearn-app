const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
  reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  targetType: { type: String, enum: ['course','user','discussion','comment'], required: true },
  targetId: { type: mongoose.Schema.Types.ObjectId, required: true },
  reason: { type: String },
  status: { type: String, enum: ['open','reviewed','closed'], default: 'open' },
  notes: String
}, { timestamps: true });

module.exports = mongoose.model('Report', ReportSchema);
