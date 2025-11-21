const mongoose = require('mongoose');

const ContactMessageSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String, required: true },
  message: { type: String, required: true },
  ip: { type: String },
  userAgent: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ContactMessage', ContactMessageSchema);
