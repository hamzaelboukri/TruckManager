import express from 'express';
import {
  getAllRoutes,
  getRouteById,
  createRoute,
  updateRoute,
  updateRouteProgress,
  deleteRoute,
  startRoute,
  completeRoute,
  getRoutesByStatus,
  getRoutesByDriver,
  getRoutesByTruck,
  getRouteStatistics,
  getMyRoutes
} from '../controllers/routeController.js';
import { authMiddleware } from '../middleware/auth.js';
import { isAdmin } from '../middleware/role.js';

const router = express.Router();

// Public statistics (authenticated users)
router.get('/statistics', authMiddleware, getRouteStatistics);

// Driver's own routes
router.get('/my-routes', authMiddleware, getMyRoutes);

// Get routes with filtering and pagination
router.get('/status/:status', authMiddleware, getRoutesByStatus);
router.get('/driver/:driverId', authMiddleware, getRoutesByDriver);
router.get('/truck/:truckId', authMiddleware, getRoutesByTruck);
router.get('/', authMiddleware, getAllRoutes);
router.get('/:id', authMiddleware, getRouteById);

// Admin only: Create, Update, Delete
router.post('/', authMiddleware, isAdmin, createRoute);
router.put('/:id', authMiddleware, isAdmin, updateRoute);
router.delete('/:id', authMiddleware, isAdmin, deleteRoute);

// Route lifecycle: Start and Complete (Admin or assigned Driver)
router.patch('/:id/start', authMiddleware, startRoute);
router.patch('/:id/complete', authMiddleware, completeRoute);

// Driver can update route progress (kilometers, fuel)
router.patch('/:id/progress', authMiddleware, updateRouteProgress);

export default router;
