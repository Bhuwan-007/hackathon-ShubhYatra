const UserProfile = require('../models/UserProfile');

const updateLocation = async (req, res) => {
  try {
    const { currentLocation } = req.body;
    const userId = req.user.id;

    if (!currentLocation || typeof currentLocation !== 'string') {
      return res.status(400).json({ error: 'currentLocation string is required' });
    }

    const user = await UserProfile.findByIdAndUpdate(
      userId, 
      { currentLocation }, 
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ currentLocation: user.currentLocation });
  } catch (error) {
    console.error('❌ Error updating location:', error);
    res.status(500).json({ error: 'Failed to update location' });
  }
};

module.exports = { updateLocation };
