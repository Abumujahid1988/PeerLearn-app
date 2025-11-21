const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  room: { type: String, required: true, index: true },
  user: {
    _id: { type: mongoose.Schema.Types.ObjectId, required: false },
    name: { type: String, required: false }
  },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Message', MessageSchema);
