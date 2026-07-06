const UserProfile = require('../models/UserProfile');
const BuddyConnection = require('../models/BuddyConnection');

// GET /api/buddies/nearby
const getNearbyBuddies = async (req, res) => {
  try {
    const { location, userId } = req.query; // In a real app, userId comes from JWT auth middleware

    if (!userId || !location) {
      return res.status(400).json({ error: 'userId and location are required' });
    }

    // Find connections where user is involved (either as requester or recipient)
    const existingConnections = await BuddyConnection.find({
      $or: [{ requesterId: userId }, { recipientId: userId }],
      status: { $in: ['pending', 'accepted'] }
    });

    // Extract all user IDs the current user is already connected/pending with
    const connectedUserIds = existingConnections.map(conn =>
      conn.requesterId.toString() === userId ? conn.recipientId : conn.requesterId
    );

    // Exclude the user themselves + anyone they already have a connection with
    const excludedIds = [userId, ...connectedUserIds];

    // Find verified users matching the location, who opted-in (visibility: true)
    const nearbyBuddies = await UserProfile.find({
      _id: { $nin: excludedIds },
      visibility: true,
      currentLocation: { $regex: location, $options: 'i' }
    }).select('displayName travelerType isVerified'); // STRIPPED: Do not return exact contact info or session keys

    res.json(nearbyBuddies);
  } catch (error) {
    console.error('❌ Error getting nearby buddies:', error);
    res.status(500).json({ error: 'Failed to fetch nearby buddies' });
  }
};

// POST /api/buddies/request
const sendRequest = async (req, res) => {
  try {
    const { requesterId, recipientId } = req.body;
    if (!requesterId || !recipientId) return res.status(400).json({ error: 'requesterId and recipientId required' });

    const newConnection = new BuddyConnection({ requesterId, recipientId, status: 'pending' });
    await newConnection.save();
    res.status(201).json(newConnection);
  } catch (error) {
    res.status(500).json({ error: 'Failed to send buddy request' });
  }
};

// POST /api/buddies/respond
const respondToRequest = async (req, res) => {
  try {
    const { connectionId, action } = req.body;
    if (!['accept', 'decline'].includes(action)) return res.status(400).json({ error: 'Invalid action (accept/decline)' });

    const status = action === 'accept' ? 'accepted' : 'declined';
    const connection = await BuddyConnection.findByIdAndUpdate(connectionId, { status }, { new: true });

    if (!connection) return res.status(404).json({ error: 'Connection not found' });
    res.json(connection);
  } catch (error) {
    res.status(500).json({ error: 'Failed to respond to request' });
  }
};

// POST /api/buddies/share-location
const shareLocation = async (req, res) => {
  try {
    const { connectionId, durationHours = 4 } = req.body;

    const connection = await BuddyConnection.findById(connectionId);
    if (!connection) return res.status(404).json({ error: 'Connection not found' });
    if (connection.status !== 'accepted') return res.status(403).json({ error: 'Connection not accepted' });

    // Extend shared location time window
    const sharedLocationUntil = new Date(Date.now() + durationHours * 3600000);
    connection.sharedLocationUntil = sharedLocationUntil;
    await connection.save();

    res.json(connection);
  } catch (error) {
    res.status(500).json({ error: 'Failed to share location' });
  }
};

// GET /api/buddies/:connectionId/messages
const getMessages = async (req, res) => {
  try {
    const { connectionId } = req.params;
    const connection = await BuddyConnection.findById(connectionId).select('messages status');
    if (!connection) return res.status(404).json({ error: 'Connection not found' });

    res.json(connection.messages);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
};

// POST /api/buddies/:connectionId/messages
const sendMessage = async (req, res) => {
  try {
    const { connectionId } = req.params;
    const { senderId, text } = req.body;

    const connection = await BuddyConnection.findById(connectionId);
    if (!connection) return res.status(404).json({ error: 'Connection not found' });
    if (connection.status !== 'accepted') return res.status(403).json({ error: 'Cannot message unless connected' });

    connection.messages.push({ senderId, text });
    await connection.save();

    res.json(connection.messages[connection.messages.length - 1]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to send message' });
  }
};

// --- TEST HELPER ---
// POST /api/buddies/test-user
const testCreateUser = async (req, res) => {
  try {
    const { sessionId, displayName, currentLocation, travelerType, visibility, isVerified } = req.body;
    const user = new UserProfile({
      sessionId: sessionId || `test-${Date.now()}`,
      displayName,
      currentLocation,
      travelerType,
      visibility,
      isVerified
    });
    await user.save();
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create test user' });
  }
};
// GET /api/buddies/connections
const getConnections = async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: 'userId is required' });

    const connections = await BuddyConnection.find({
      $or: [{ requesterId: userId }, { recipientId: userId }]
    }).populate('requesterId', 'displayName isVerified currentLocation travelerType')
      .populate('recipientId', 'displayName isVerified currentLocation travelerType')
      .sort({ updatedAt: -1 });

    res.json(connections);
  } catch (error) {
    console.error('❌ Error fetching connections:', error);
    res.status(500).json({ error: 'Failed to fetch connections' });
  }
};

// PATCH /api/buddies/visibility
const updateVisibility = async (req, res) => {
  try {
    const { userId, visibility } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId is required' });

    const user = await UserProfile.findByIdAndUpdate(userId, { visibility }, { new: true });
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({ visibility: user.visibility });
  } catch (error) {
    console.error('❌ Error updating visibility:', error);
    res.status(500).json({ error: 'Failed to update visibility' });
  }
};

module.exports = {
  getNearbyBuddies,
  sendRequest,
  respondToRequest,
  shareLocation,
  getMessages,
  sendMessage,
  testCreateUser,
  getConnections,
  updateVisibility
};
