const mongoose = require('mongoose');

const userProfileSchema = new mongoose.Schema({
  sessionId: { type: String, required: true },
  travelerType: [{ 
    type: String,
    enum: ['solo', 'elderly', 'disabled', 'non-native-speaker', 'family']
  }],
  preferredLanguage: { type: String, default: 'English' }
});

module.exports = mongoose.model('UserProfile', userProfileSchema);
