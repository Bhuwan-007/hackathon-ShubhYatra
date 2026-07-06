const UserProfile = require('../models/UserProfile');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_dev';
const EXPIRES_IN = '7d';

const register = async (req, res) => {
  try {
    const { email, password, displayName } = req.body;
    if (!email || !password || !displayName) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = new UserProfile({
      email,
      passwordHash,
      displayName,
      isVerified: true // baseline trust
    });

    await user.save();
    
    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: EXPIRES_IN });
    res.status(201).json({ token, user: { id: user._id, displayName: user.displayName, currentLocation: user.currentLocation } });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const user = await UserProfile.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: EXPIRES_IN });
    res.json({ token, user: { id: user._id, displayName: user.displayName, currentLocation: user.currentLocation } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

const demo = async (req, res) => {
  try {
    const email = 'demo@shubhyatra.com';
    let user = await UserProfile.findOne({ email });

    if (!user) {
      const passwordHash = await bcrypt.hash('demopassword123', 10);
      user = new UserProfile({
        email,
        passwordHash,
        displayName: 'Demo User',
        currentLocation: 'Paharganj, Delhi',
        isVerified: true,
        visibility: true
      });
      await user.save();
    }

    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: EXPIRES_IN });
    res.json({ token, user: { id: user._id, displayName: user.displayName, currentLocation: user.currentLocation } });
  } catch (error) {
    console.error('Demo login error:', error);
    res.status(500).json({ error: 'Demo login failed' });
  }
};

module.exports = { register, login, demo };
