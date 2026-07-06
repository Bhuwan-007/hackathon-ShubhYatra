const mongoose = require('mongoose');

const destinationRiskSchema = new mongoose.Schema({
  location: { type: String, required: true, index: true },
  overall_risk_score: { type: Number, required: true, min: 1, max: 100 },
  active_scams: [{ type: String }],
  safe_zones: [{ type: String }],
  embedding: [{ type: Number }], // For vector search later
  last_updated: { type: Date, default: Date.now }
});

module.exports = mongoose.model('DestinationRisk', destinationRiskSchema);
