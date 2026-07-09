const jwt = require('jsonwebtoken');
const { User } = require('../models');

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.userId);

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    if (!user.isActive) {
      return res.status(403).json({ error: 'Account is inactive' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    return res.status(401).json({ error: 'Invalid token' });
  }
};

const optionalAuthenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.userId);

    if (user && user.isActive) {
      req.user = user;
    }
    next();
  } catch (error) {
    // Invalid token, but continue without user
    next();
  }
};

const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};

const requireOwnership = (modelName) => {
  return async (req, res, next) => {
    try {
      const Model = require('../models')[modelName];
      const resource = await Model.findByPk(req.params.id);

      if (!resource) {
        return res.status(404).json({ error: `${modelName} not found` });
      }

      // Admin can access any resource
      if (req.user.role === 'admin') {
        req.resource = resource;
        return next();
      }

      // Check ownership based on model
      let isOwner = false;
      switch (modelName) {
        case 'Job':
          isOwner = resource.recruiterId === req.user.id;
          break;
        case 'Application':
          isOwner = resource.userId === req.user.id || 
                    (req.user.role === 'recruiter' && resource.job.recruiterId === req.user.id);
          break;
        case 'Bookmark':
        case 'Notification':
          isOwner = resource.userId === req.user.id;
          break;
        default:
          isOwner = resource.userId === req.user.id;
      }

      if (!isOwner) {
        return res.status(403).json({ error: 'You do not have permission to access this resource' });
      }

      req.resource = resource;
      next();
    } catch (error) {
      console.error('Ownership check error:', error);
      res.status(500).json({ error: 'Failed to check resource ownership' });
    }
  };
};

module.exports = {
  authenticateToken,
  optionalAuthenticateToken,
  requireRole,
  requireOwnership
}; 