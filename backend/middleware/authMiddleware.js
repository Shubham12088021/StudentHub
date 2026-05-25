const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');

// Protect routes - verify JWT token
const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized - no token provided');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      res.status(401);
      throw new Error('Not authorized - user not found');
    }

    if (!req.user.isActive) {
      res.status(401);
      throw new Error('Account has been deactivated');
    }

    next();
  } catch (error) {
    res.status(401);
    throw new Error('Not authorized - invalid token');
  }
});

// Role-based authorization
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      res.status(403);
      throw new Error(`Role '${req.user.role}' is not authorized to access this route`);
    }
    next();
  };
};

// Check if instructor is approved
const requireApproved = asyncHandler(async (req, res, next) => {
  if (req.user.role === 'instructor' && !req.user.isApproved) {
    res.status(403);
    throw new Error('Your instructor account is pending approval');
  }
  next();
});

module.exports = { protect, authorize, requireApproved };
