import express from 'express';
import { getAllDrivers, getDriverById } from '../controllers/driverController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authMiddleware, getAllDrivers);
router.get('/:id', authMiddleware, getDriverById);

export default router;
