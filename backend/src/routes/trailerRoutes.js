import express from 'express';
import {
    createTrailer,
    getAllTrailers,
    getTrailerById,
    getTrailerByRegistration,
    updateTrailer,
    deleteTrailer,
    updateKilometers,
    updateStatus,
    updateCondition,
    getTrailersByStatus,
    getTrailersByType,
    getAvailableTrailers,
    searchTrailers,
    getTrailerStatistics,
    getTrailerMaintenanceInfo,
    updateMaintenanceInfo
} from '../controllers/trailerController.js';
import { authMiddleware } from '../middleware/auth.js';
import { isAdmin, isAdminOrDriver } from '../middleware/role.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/statistics', isAdminOrDriver, getTrailerStatistics);
router.get('/available', isAdminOrDriver, getAvailableTrailers);
router.get('/search', isAdminOrDriver, searchTrailers);
router.get('/status/:status', isAdminOrDriver, getTrailersByStatus);
router.get('/type/:type', isAdminOrDriver, getTrailersByType);

router
    .route('/')
    .get(isAdminOrDriver, getAllTrailers)
    .post(isAdmin, createTrailer);

router
    .route('/:id')
    .get(isAdminOrDriver, getTrailerById)
    .put(isAdmin, updateTrailer)
    .delete(isAdmin, deleteTrailer);

router.get('/registration/:registrationNumber', isAdminOrDriver, getTrailerByRegistration);
router.patch('/:id/kilometers', isAdmin, updateKilometers);
router.patch('/:id/status', isAdmin, updateStatus);
router.patch('/:id/condition', isAdmin, updateCondition);
router.get('/:id/maintenance', isAdminOrDriver, getTrailerMaintenanceInfo);
router.patch('/:id/maintenance', isAdmin, updateMaintenanceInfo);

export default router;
