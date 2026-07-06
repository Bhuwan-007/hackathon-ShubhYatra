const mongoose = require('mongoose');

const userReportSchema = new mongoose.Schema({
  location: { type: String, required: true },
  description: { type: String, required: true },
  category: { 
    type: String, 
    required: true, 
    enum: ['scam', 'theft', 'harassment', 'infrastructure', 'other'] 
  },
  imageUrl: { type: String, default: null },
  severity: { type: Number, required: true, min: 1, max: 5 },
  reportedAt: { type: Date, default: Date.now },
  status: { 
    type: String, 
    default: 'pending',
    enum: ['pending', 'verified', 'resolved']
  },
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'UserProfile', default: null }
}, { timestamps: true });

module.exports = mongoose.model('UserReport', userReportSchema);
