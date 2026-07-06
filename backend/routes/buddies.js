const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/authMiddleware');

const { 
  getNearbyBuddies, 
  sendRequest, 
  respondToRequest,
  shareLocation,
  getMessages,
  sendMessage,
  testCreateUser,
  getConnections,
  updateVisibility
} = require('../controllers/buddyController');

// All buddy routes require authentication
router.use(requireAuth);

router.get('/nearby', getNearbyBuddies);
router.get('/connections', getConnections);
router.patch('/visibility', updateVisibility);
router.post('/request', sendRequest);
router.post('/respond', respondToRequest);
router.post('/share-location', shareLocation);

// Simple message threading (polling)
router.get('/:connectionId/messages', getMessages);
router.post('/:connectionId/messages', sendMessage);

module.exports = router;
