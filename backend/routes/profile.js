const express = require('express');
const router = express.Router();
const { updateLocation } = require('../controllers/profileController');
const { requireAuth } = require('../middleware/authMiddleware');

router.use(requireAuth);
router.patch('/location', updateLocation);

module.exports = router;
