const express = require('express');
const router = express.Router();
const { register, login, demo } = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.post('/demo', demo);

module.exports = router;
