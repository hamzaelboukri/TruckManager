import express from 'express';
import {
  getAllTires,
  getTireById,
  createTire,
  updateTire,
  deleteTire,
  getTiresByStatus,
  getTiresByVehicle,
  updateTireWear,
  getTiresNeedingReplacement,
  getTiresWithWarning,
  getTireStatistics,
  searchTires
} from '../controllers/tireController.js';
import { authMiddleware } from '../middleware/auth.js';
import { isAdmin } from '../middleware/role.js';

const router = express.Router();

// Public/Protected routes (all authenticated users)
router.get('/search', authMiddleware, searchTires);
router.get('/statistics', authMiddleware, getTireStatistics);
router.get('/status/:status', authMiddleware, getTiresByStatus);
router.get('/vehicle/:ownerType/:vehicleId', authMiddleware, getTiresByVehicle);
router.get('/need-replacement', authMiddleware, getTiresNeedingReplacement);
router.get('/warning', authMiddleware, getTiresWithWarning);
router.get('/', authMiddleware, getAllTires);
router.get('/:id', authMiddleware, getTireById);

// Admin only routes
router.post('/', authMiddleware, isAdmin, createTire);
router.put('/:id', authMiddleware, isAdmin, updateTire);
router.patch('/:id/wear', authMiddleware, isAdmin, updateTireWear);
router.delete('/:id', authMiddleware, isAdmin, deleteTire);

export default router;
