import express from 'express';
import {
    // Rules
    createRule,
    getAllRules,
    getRuleById,
    getRulesByVehicle,
    updateRule,
    deleteRule,
    toggleRuleStatus,
    // Records
    createRecord,
    getAllRecords,
    getRecordById,
    getVehicleMaintenanceHistory,
    updateRecord,
    completeRecord,
    cancelRecord,
    deleteRecord,
    // Check & Notifications
    checkDueMaintenance,
    checkAllDueMaintenance,
    getUpcomingMaintenance,
    getOverdueMaintenance,
    // Statistics
    getMaintenanceStatistics,
    getVehicleMaintenanceCost
} from '../controllers/maintenanceController.js';
import { authMiddleware } from '../middleware/auth.js';
import { isAdmin } from '../middleware/role.js';

const router = express.Router();

router.use(authMiddleware);

router
    .route('/rules')
    .get(isAdmin, getAllRules)
    .post(isAdmin, createRule);

router
    .route('/rules/:id')
    .get(isAdmin, getRuleById)
    .put(isAdmin, updateRule)
    .delete(isAdmin, deleteRule);

router.patch(
    '/rules/:id/toggle',
    isAdmin,
    toggleRuleStatus
);

router.get(
    '/rules/vehicle/:vehicleType/:vehicleId',
    getRulesByVehicle
);

router
    .route('/records')
    .get(isAdmin, getAllRecords)
    .post(isAdmin, createRecord);

router
    .route('/records/:id')
    .get(getRecordById)
    .put(isAdmin, updateRecord)
    .delete(isAdmin, deleteRecord);

router.patch(
    '/records/:id/complete',
    isAdmin,
    completeRecord
);

router.patch(
    '/records/:id/cancel',
    isAdmin,
    cancelRecord
);

router.get(
    '/records/vehicle/:vehicleType/:vehicleId',
    getVehicleMaintenanceHistory
);

router.get(
    '/check/:vehicleType/:vehicleId',
    checkDueMaintenance
);

router.get(
    '/check-all',
    isAdmin,
    checkAllDueMaintenance
);

router.get(
    '/upcoming',
    isAdmin,
    getUpcomingMaintenance
);

router.get(
    '/overdue',
    isAdmin,
    getOverdueMaintenance
);

router.get(
    '/statistics',
    isAdmin,
    getMaintenanceStatistics
);

router.get(
    '/cost/:vehicleType/:vehicleId',
    isAdmin,
    getVehicleMaintenanceCost
);

export default router;
