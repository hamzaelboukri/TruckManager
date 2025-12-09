import { jest } from '@jest/globals';
import { isAdmin, isDriver } from '../../middleware/role.js';

describe('Role Middleware Tests', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      user: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('isAdmin Middleware', () => {
    test('should allow access for Admin role', () => {
      req.user.role = 'Admin';

      isAdmin(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    test('should deny access for non-Admin role', () => {
      req.user.role = 'Driver';

      isAdmin(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'You do not have permission to access this resource'
      });
      expect(next).not.toHaveBeenCalled();
    });

    test('should deny access when role is undefined', () => {
      req.user = {};

      isAdmin(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'You do not have permission to access this resource'
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('isDriver Middleware', () => {
    test('should allow access for Driver role', () => {
      req.user.role = 'Driver';

      isDriver(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    test('should deny access for non-Driver role', () => {
      req.user.role = 'Admin';

      isDriver(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'You do not have permission to access this resource'
      });
      expect(next).not.toHaveBeenCalled();
    });

    test('should deny access when role is undefined', () => {
      req.user = {};

      isDriver(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'You do not have permission to access this resource'
      });
      expect(next).not.toHaveBeenCalled();
    });
  });
});
