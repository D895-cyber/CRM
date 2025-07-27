const jwt = require('jsonwebtoken');
const User = require('../models/User');
const JWT_SECRET = 'testsecret'; // Use env in production

async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'No token provided' });
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    // Fetch the user from DB to get _id and all fields
    const user = await User.findById(decoded.userId);
    if (!user) return res.status(401).json({ message: 'User not found' });
    req.user = user; // This ensures req.user._id is available
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
}

function requireAdmin(req, res, next) {
  if (req.user && req.user.role === 'Admin') return next();
  return res.status(403).json({ message: 'Admin access required' });
}

function requireAdminOrManager(req, res, next) {
  if (req.user && (req.user.role === 'Admin' || req.user.role === 'Manager')) return next();
  return res.status(403).json({ message: 'Admin or Manager access required' });
}

module.exports = { authenticate, requireAdmin, requireAdminOrManager }; 