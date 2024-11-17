const jwt = require('jsonwebtoken');
const redis = require('../services/redisService');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
      return res.status(401).json({ message: 'No authorization token found' });
    }

    // Extract the token from "Bearer <token>"
    const token = authHeader.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token found' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Try to get user from Redis first
    const cachedUser = await redis.get(`user:id:${decoded.id}`);

    if (cachedUser) {
      // If found in Redis, use cached data directly
      console.log('User found in Redis cache');
      req.user = JSON.parse(cachedUser);
      next();
    } else {
      // If not in Redis, get from DB
      console.log('User not found in Redis or cache expired, fetching from DB');
      const user = await User.findById(decoded.id);
      
      if (!user) {
        throw new Error('User not found');
      }

      req.user = {
        _id: user._id.toString(),
        username: user.username,
        role: user.role,
        permissions: user.permissions
      };
      next();
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Token is invalid' });
  }
};

const checkPermission = (requiredPermission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    if (!req.user.permissions || !req.user.permissions.includes(requiredPermission)) {
      return res.status(403).json({ message: 'Permission denied' });
    }

    next();
  };
};

module.exports = { auth, checkPermission }; 