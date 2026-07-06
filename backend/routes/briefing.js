const express = require('express');
const router = express.Router();
const { generateSafetyBriefing } = require('../services/geminiService');

// POST /api/briefing
router.post('/', async (req, res) => {
  try {
    const { location, travelerType } = req.body;
    
    if (!location) {
      return res.status(400).json({ error: 'Location is required in the request body.' });
    }

    const briefing = await generateSafetyBriefing(location, travelerType || []);
    res.json(briefing);
  } catch (error) {
    console.error('❌ Error in /api/briefing route:', error);
    res.status(500).json({ error: 'Failed to generate safety briefing.' });
  }
});

module.exports = router;
