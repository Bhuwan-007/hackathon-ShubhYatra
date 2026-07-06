const UserProfile = require('../models/UserProfile');

const requireAdmin = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Unauthorized: No user found in request' });
    }

    const user = await UserProfile.findById(req.user.id);
    if (!user || !user.isAdmin) {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }

    next();
  } catch (error) {
    console.error('requireAdmin error:', error);
    return res.status(500).json({ error: 'Server error verifying admin access' });
  }
};

module.exports = { requireAdmin };
