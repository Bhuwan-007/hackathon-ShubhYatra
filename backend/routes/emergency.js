const express = require('express');
const router = express.Router();
const { generateEmergencyPlan } = require('../services/geminiService');

const VALID_EMERGENCY_TYPES = ['lost_passport', 'medical', 'theft', 'harassment'];

// POST /api/emergency-plan
router.post('/', async (req, res) => {
  try {
    const { location, emergencyType } = req.body;
    
    if (!location) {
      return res.status(400).json({ error: 'Location is required.' });
    }
    
    if (!emergencyType || !VALID_EMERGENCY_TYPES.includes(emergencyType)) {
      return res.status(400).json({ 
        error: `Invalid or missing emergencyType. Must be one of: ${VALID_EMERGENCY_TYPES.join(', ')}` 
      });
    }

    const plan = await generateEmergencyPlan(location, emergencyType);
    res.json(plan);
  } catch (error) {
    console.error('❌ Error in /api/emergency-plan route:', error);
    res.status(500).json({ error: 'Failed to generate emergency plan.' });
  }
});

module.exports = router;
