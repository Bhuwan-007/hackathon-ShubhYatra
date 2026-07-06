const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'UserProfile', required: true },
  text: { type: String, required: true },
  sentAt: { type: Date, default: Date.now }
});

const buddyConnectionSchema = new mongoose.Schema({
  requesterId: { type: mongoose.Schema.Types.ObjectId, ref: 'UserProfile', required: true },
  recipientId: { type: mongoose.Schema.Types.ObjectId, ref: 'UserProfile', required: true },
  status: { type: String, enum: ['pending', 'accepted', 'declined'], default: 'pending' },
  sharedLocationUntil: { type: Date, default: null },
  messages: [messageSchema]
}, { timestamps: true });

module.exports = mongoose.model('BuddyConnection', buddyConnectionSchema);
