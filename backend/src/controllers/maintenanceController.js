import maintenanceService from '../services/maintenanceService.js';

export const createRule = async (req, res) => {
    try {
        const rule = await maintenanceService.createRule(req.body);
        res.status(201).json({
            success: true,
            message: 'Maintenance rule created successfully',
            data: rule
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

export const getAllRules = async (req, res) => {
    try {
        const { page, limit, sortBy, vehicleType, maintenanceType, isActive } = req.query;

        const filters = {};
        if (vehicleType) filters.vehicleType = vehicleType;
        if (maintenanceType) filters.maintenanceType = maintenanceType;
        if (isActive !== undefined) filters.isActive = isActive === 'true';

        const options = { page, limit, sortBy };
        const result = await maintenanceService.getAllRules(filters, options);

        res.status(200).json({
            success: true,
            ...result
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

export const getRuleById = async (req, res) => {
    try {
        const rule = await maintenanceService.getRuleById(req.params.id);
        res.status(200).json({
            success: true,
            data: rule
        });
    } catch (error) {
        res.status(404).json({
            success: false,
            message: error.message
        });
    }
};

export const getRulesByVehicle = async (req, res) => {
    try {
        const { vehicleType, vehicleId } = req.params;
        const rules = await maintenanceService.getRulesByVehicle(vehicleType, vehicleId);
        
        res.status(200).json({
            success: true,
            count: rules.length,
            data: rules
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

export const updateRule = async (req, res) => {
    try {
        const rule = await maintenanceService.updateRule(req.params.id, req.body);
        res.status(200).json({
            success: true,
            message: 'Maintenance rule updated successfully',
            data: rule
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

export const deleteRule = async (req, res) => {
    try {
        await maintenanceService.deleteRule(req.params.id);
        res.status(200).json({
            success: true,
            message: 'Maintenance rule deleted successfully'
        });
    } catch (error) {
        res.status(404).json({
            success: false,
            message: error.message
        });
    }
};

export const toggleRuleStatus = async (req, res) => {
    try {
        const { isActive } = req.body;
        const rule = await maintenanceService.toggleRuleStatus(req.params.id, isActive);
        
        res.status(200).json({
            success: true,
            message: `Maintenance rule ${isActive ? 'activated' : 'deactivated'} successfully`,
            data: rule
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

export const createRecord = async (req, res) => {
    try {
        const recordData = {
            ...req.body,
            createdBy: req.user.userId
        };
        
        const record = await maintenanceService.createRecord(recordData);
        res.status(201).json({
            success: true,
            message: 'Maintenance record created successfully',
            data: record
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

export const getAllRecords = async (req, res) => {
    try {
        const { page, limit, sortBy, vehicleType, maintenanceType, status, priority } = req.query;

        const filters = {};
        if (vehicleType) filters.vehicleType = vehicleType;
        if (maintenanceType) filters.maintenanceType = maintenanceType;
        if (status) filters.status = status;
        if (priority) filters.priority = priority;

        const options = { page, limit, sortBy };
        const result = await maintenanceService.getAllRecords(filters, options);

        res.status(200).json({
            success: true,
            ...result
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

export const getRecordById = async (req, res) => {
    try {
        const record = await maintenanceService.getRecordById(req.params.id);
        res.status(200).json({
            success: true,
            data: record
        });
    } catch (error) {
        res.status(404).json({
            success: false,
            message: error.message
        });
    }
};

export const getVehicleMaintenanceHistory = async (req, res) => {
    try {
        const { vehicleType, vehicleId } = req.params;
        const { page, limit } = req.query;
        
        const options = { page, limit };
        const result = await maintenanceService.getVehicleMaintenanceHistory(
            vehicleType, 
            vehicleId, 
            options
        );

        res.status(200).json({
            success: true,
            ...result
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

export const updateRecord = async (req, res) => {
    try {
        const record = await maintenanceService.updateRecord(req.params.id, req.body);
        res.status(200).json({
            success: true,
            message: 'Maintenance record updated successfully',
            data: record
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

export const completeRecord = async (req, res) => {
    try {
        const record = await maintenanceService.completeRecord(req.params.id, req.body);
        res.status(200).json({
            success: true,
            message: 'Maintenance completed successfully',
            data: record
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

export const cancelRecord = async (req, res) => {
    try {
        const { reason } = req.body;
        const record = await maintenanceService.cancelRecord(req.params.id, reason);
        
        res.status(200).json({
            success: true,
            message: 'Maintenance cancelled successfully',
            data: record
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

export const deleteRecord = async (req, res) => {
    try {
        await maintenanceService.deleteRecord(req.params.id);
        res.status(200).json({
            success: true,
            message: 'Maintenance record deleted successfully'
        });
    } catch (error) {
        res.status(404).json({
            success: false,
            message: error.message
        });
    }
};

export const checkDueMaintenance = async (req, res) => {
    try {
        const { vehicleType, vehicleId } = req.params;
        const result = await maintenanceService.checkDueMaintenance(vehicleType, vehicleId);
        
        res.status(200).json({
            success: true,
            ...result
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

export const checkAllDueMaintenance = async (req, res) => {
    try {
        const allDue = await maintenanceService.checkAllDueMaintenance();
        
        res.status(200).json({
            success: true,
            count: allDue.length,
            data: allDue
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

export const getUpcomingMaintenance = async (req, res) => {
    try {
        const { days = 30 } = req.query;
        const upcoming = await maintenanceService.getUpcomingMaintenance(Number(days));
        
        res.status(200).json({
            success: true,
            count: upcoming.length,
            data: upcoming
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

export const getOverdueMaintenance = async (req, res) => {
    try {
        const overdue = await maintenanceService.getOverdueMaintenance();
        
        res.status(200).json({
            success: true,
            count: overdue.length,
            data: overdue
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

export const getMaintenanceStatistics = async (req, res) => {
    try {
        const { startDate, endDate, vehicleType, maintenanceType } = req.query;
        
        const filters = {};
        if (startDate) filters.startDate = startDate;
        if (endDate) filters.endDate = endDate;
        if (vehicleType) filters.vehicleType = vehicleType;
        if (maintenanceType) filters.maintenanceType = maintenanceType;

        const stats = await maintenanceService.getMaintenanceStatistics(filters);
        
        res.status(200).json({
            success: true,
            data: stats
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

export const getVehicleMaintenanceCost = async (req, res) => {
    try {
        const { vehicleType, vehicleId } = req.params;
        const { startDate, endDate } = req.query;
        
        const filters = {};
        if (startDate) filters.startDate = startDate;
        if (endDate) filters.endDate = endDate;

        const cost = await maintenanceService.getVehicleMaintenanceCost(
            vehicleType, 
            vehicleId, 
            filters
        );
        
        res.status(200).json({
            success: true,
            vehicleType,
            vehicleId,
            data: cost
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};
