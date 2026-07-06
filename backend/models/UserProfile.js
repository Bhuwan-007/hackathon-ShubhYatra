const mongoose = require('mongoose');

const userProfileSchema = new mongoose.Schema({
  sessionId: { type: String, required: true },
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
