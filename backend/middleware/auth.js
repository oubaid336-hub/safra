const jwt = require('jsonwebtoken');
const User = require('../models/User');

async function requireAuth(req, res, next) {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: 'Please log in' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId).select('role isBlocked verified');
    if (!user) {
      return res.status(401).json({ message: 'Invalid or expired session' });
    }
    if (user.isBlocked) {
      return res.status(403).json({ message: 'This account has been blocked' });
    }

    req.user = { userId: decoded.userId, role: user.role, verified: user.verified };
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired session' });
  }
}

function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access only' });
  }
  next();
}

module.exports = { requireAuth, requireAdmin };
