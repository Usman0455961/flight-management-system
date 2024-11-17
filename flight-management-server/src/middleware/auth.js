const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
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
    console.log('Decoded token:', decoded);
    req.user = decoded;
    next();
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

    console.log(req.user);
    

    if (!req.user.permissions || !req.user.permissions.includes(requiredPermission)) {
      return res.status(403).json({ message: 'Permission denied' });
    }

    next();
  };
};

module.exports = { auth, checkPermission }; 