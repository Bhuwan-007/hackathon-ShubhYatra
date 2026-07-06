const express = require('express');
const router = express.Router();
const { 
  getNearbyBuddies, 
  sendRequest, 
  respondToRequest, 
  shareLocation, 
  getMessages, 
  sendMessage,
  testCreateUser
} = require('../controllers/buddyController');

// Test Helper (so you can generate users in Postman easily)
router.post('/test-user', testCreateUser);

router.get('/nearby', getNearbyBuddies);
router.post('/request', sendRequest);
router.post('/respond', respondToRequest);
router.post('/share-location', shareLocation);

// Simple message threading (polling)
router.get('/:connectionId/messages', getMessages);
router.post('/:connectionId/messages', sendMessage);

module.exports = router;
