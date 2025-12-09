import config from '../config/config.js';

export const roleMiddleware = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'You do not have permission to access this resource'
      });
    }

    next();
  };
};

export const isAdmin = roleMiddleware('Admin');
export const isDriver = roleMiddleware('Driver');
export const isAdminOrDriver = roleMiddleware('Admin', 'Driver');

export default roleMiddleware;
