import express from 'express';
import {
  getAllTrucks,
  getTruckById,
  createTruck,
  updateTruck,
  deleteTruck,
  getTrucksByStatus,
  updateTruckStatus,
  updateTruckKilometers,
  getAvailableTrucks,
  getTruckStatistics,
  searchTrucks
} from '../controllers/truckController.js';
import { authMiddleware } from '../middleware/auth.js';
import { isAdmin } from '../middleware/role.js';

const router = express.Router();

// Public/Protected routes
router.get('/search', authMiddleware, searchTrucks);
router.get('/statistics', authMiddleware, getTruckStatistics);
router.get('/available', authMiddleware, getAvailableTrucks);
router.get('/status/:status', authMiddleware, getTrucksByStatus);
router.get('/', authMiddleware, getAllTrucks);
router.get('/:id', authMiddleware, getTruckById);

// Admin only routes
router.post('/', authMiddleware, isAdmin, createTruck);
router.put('/:id', authMiddleware, isAdmin, updateTruck);
router.patch('/:id/status', authMiddleware, isAdmin, updateTruckStatus);
router.patch('/:id/kilometers', authMiddleware, isAdmin, updateTruckKilometers);
router.delete('/:id', authMiddleware, isAdmin, deleteTruck);

export default router;
