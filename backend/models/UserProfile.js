const mongoose = require('mongoose');

const userProfileSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  sessionId: {
    type: String, // Deprecated, but keeping for backwards compatibility if needed
  },
  travelerType: [{ 
    type: String,
    enum: ['solo', 'elderly', 'disabled', 'non-native-speaker', 'family']
  }],
  preferredLanguage: { type: String, default: 'English' },
  displayName: { type: String },
  currentLocation: { type: String },
  travelDates: {
    start: Date,
    end: Date
  },
  isVerified: { type: Boolean, default: false },
  visibility: { type: Boolean, default: false } // Opt-in privacy feature
});

module.exports = mongoose.model('UserProfile', userProfileSchema);
