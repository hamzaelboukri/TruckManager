import MaintenanceRule from '../models/MaintenanceRule.js';
import MaintenanceRecord from '../models/MaintenanceRecord.js';
import truckService from './truckService.js';
import trailerService from './trailerService.js';
import tireService from './tireService.js';

class MaintenanceService {
    async createRule(ruleData) {
        if (ruleData.vehicleId) {
            await this.validateVehicleExists(ruleData.vehicleType, ruleData.vehicleId);
        }

        const rule = await MaintenanceRule.create(ruleData);
        await rule.populate('vehicleId');
        return rule;
    }

    async getAllRules(filters = {}, options = {}) {
        const { page = 1, limit = 10, sortBy = '-createdAt' } = options;
        const skip = (page - 1) * limit;

        const query = { ...filters };
        
        const rules = await MaintenanceRule.find(query)
            .populate('vehicleId')
            .sort(sortBy)
            .skip(skip)
            .limit(limit);

        const total = await MaintenanceRule.countDocuments(query);

        return {
            rules,
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
                pages: Math.ceil(total / limit)
            }
        };
    }

    async getRuleById(ruleId) {
        const rule = await MaintenanceRule.findById(ruleId).populate('vehicleId');
        if (!rule) {
            throw new Error('Maintenance rule not found');
        }
        return rule;
    }

    async getRulesByVehicle(vehicleType, vehicleId) {
        await this.validateVehicleExists(vehicleType, vehicleId);

        const rules = await MaintenanceRule.find({
            vehicleType,
            vehicleId,
            isActive: true
        }).sort('-createdAt');

        return rules;
    }

    async updateRule(ruleId, updateData) {
        const rule = await MaintenanceRule.findById(ruleId);
        if (!rule) {
            throw new Error('Maintenance rule not found');
        }

        if (updateData.vehicleId && updateData.vehicleType) {
            await this.validateVehicleExists(updateData.vehicleType, updateData.vehicleId);
        }

        Object.assign(rule, updateData);
        await rule.save();
        await rule.populate('vehicleId');
        
        return rule;
    }

    async deleteRule(ruleId) {
        const rule = await MaintenanceRule.findByIdAndDelete(ruleId);
        if (!rule) {
            throw new Error('Maintenance rule not found');
        }
        return rule;
    }

    async toggleRuleStatus(ruleId, isActive) {
        const rule = await MaintenanceRule.findById(ruleId);
        if (!rule) {
            throw new Error('Maintenance rule not found');
        }

        rule.isActive = isActive;
        await rule.save();
        await rule.populate('vehicleId');
        
        return rule;
    }

    async createRecord(recordData) {
        await this.validateVehicleExists(recordData.vehicleType, recordData.vehicleId);

        const record = await MaintenanceRecord.create(recordData);
        await record.populate(['vehicleId', { path: 'createdBy', select: 'name email' }]);
        
        return record;
    }

    async getAllRecords(filters = {}, options = {}) {
        const { page = 1, limit = 10, sortBy = '-date' } = options;
        const skip = (page - 1) * limit;

        const query = { ...filters };
        
        const records = await MaintenanceRecord.find(query)
            .populate('vehicleId')
            .populate('createdBy', 'name email')
            .sort(sortBy)
            .skip(skip)
            .limit(limit);

        const total = await MaintenanceRecord.countDocuments(query);

        return {
            records,
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
                pages: Math.ceil(total / limit)
            }
        };
    }

    async getRecordById(recordId) {
        const record = await MaintenanceRecord.findById(recordId)
            .populate('vehicleId')
            .populate('createdBy', 'name email');
            
        if (!record) {
            throw new Error('Maintenance record not found');
        }
        return record;
    }

    async getVehicleMaintenanceHistory(vehicleType, vehicleId, options = {}) {
        await this.validateVehicleExists(vehicleType, vehicleId);

        const { page = 1, limit = 10 } = options;
        const skip = (page - 1) * limit;

        const records = await MaintenanceRecord.find({
            vehicleType,
            vehicleId
        })
            .populate('createdBy', 'name email')
            .sort('-date')
            .skip(skip)
            .limit(limit);

        const total = await MaintenanceRecord.countDocuments({ vehicleType, vehicleId });

        return {
            records,
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
                pages: Math.ceil(total / limit)
            }
        };
    }

    async updateRecord(recordId, updateData) {
        const record = await MaintenanceRecord.findById(recordId);
        if (!record) {
            throw new Error('Maintenance record not found');
        }

        Object.assign(record, updateData);
        await record.save();
        await record.populate(['vehicleId', { path: 'createdBy', select: 'name email' }]);
        
        return record;
    }

    async completeRecord(recordId, completionData) {
        const record = await MaintenanceRecord.findById(recordId);
        if (!record) {
            throw new Error('Maintenance record not found');
        }

        await record.complete(completionData);
        await record.populate(['vehicleId', { path: 'createdBy', select: 'name email' }]);
        
        return record;
    }

    async cancelRecord(recordId, reason) {
        const record = await MaintenanceRecord.findById(recordId);
        if (!record) {
            throw new Error('Maintenance record not found');
        }

        await record.cancel(reason);
        await record.populate(['vehicleId', { path: 'createdBy', select: 'name email' }]);
        
        return record;
    }

    async deleteRecord(recordId) {
        const record = await MaintenanceRecord.findByIdAndDelete(recordId);
        if (!record) {
            throw new Error('Maintenance record not found');
        }
        return record;
    }

    async checkDueMaintenance(vehicleType, vehicleId, autoCreate = false) {
        await this.validateVehicleExists(vehicleType, vehicleId);

        const vehicle = await this.getVehicle(vehicleType, vehicleId);
        
        const rules = await MaintenanceRule.find({
            vehicleType,
            vehicleId,
            isActive: true
        });

        const lastMaintenances = await this.getLastMaintenanceForEachType(vehicleType, vehicleId);

        const dueMaintenances = [];
        const createdRecords = [];

        for (const rule of rules) {
            const lastMaintenance = lastMaintenances.get(rule.maintenanceType);
            const dueCheck = rule.isDue(
                vehicle.currentKilometers,
                lastMaintenance ? lastMaintenance.kilometersAtMaintenance : 0,
                lastMaintenance ? lastMaintenance.date : vehicle.createdAt
            );

            if (dueCheck.isDue) {
                dueMaintenances.push({
                    rule: rule.toObject(),
                    lastMaintenance: lastMaintenance ? lastMaintenance.toObject() : null,
                    ...dueCheck
                });

                if (autoCreate) {
                    const existingPending = await MaintenanceRecord.findOne({
                        vehicleType,
                        vehicleId,
                        maintenanceType: rule.maintenanceType,
                        status: { $in: ['Pending', 'InProgress'] }
                    });

                    if (!existingPending) {
                        const newRecord = await MaintenanceRecord.create({
                            vehicleType,
                            vehicleId,
                            maintenanceType: rule.maintenanceType,
                            description: `Maintenance automatique - ${rule.description || rule.maintenanceType}`,
                            priority: dueCheck.urgency === 'Urgent' ? 'High' : dueCheck.urgency === 'Soon' ? 'Medium' : 'Low',
                            status: 'Pending',
                            scheduledDate: new Date(),
                            kilometersAtMaintenance: vehicle.currentKilometers,
                            estimatedCost: rule.estimatedCost || 0
                        });
                        createdRecords.push(newRecord);
                    }
                }
            }
        }

        return {
            vehicle: vehicle.toObject(),
            dueMaintenances,
            hasDueMaintenance: dueMaintenances.length > 0,
            createdRecords: autoCreate ? createdRecords : undefined
        };
    }

    async checkAllDueMaintenance(autoCreate = false) {
        const allDue = [];
        let totalCreated = 0;

        const trucks = await truckService.getAllTrucks({}, { page: 1, limit: 1000 });
        for (const truck of trucks.trucks) {
            const dueCheck = await this.checkDueMaintenance('Truck', truck._id, autoCreate);
            if (dueCheck.hasDueMaintenance) {
                allDue.push({
                    vehicleType: 'Truck',
                    ...dueCheck
                });
                if (autoCreate && dueCheck.createdRecords) {
                    totalCreated += dueCheck.createdRecords.length;
                }
            }
        }

        try {
            const trailers = await trailerService.getAllTrailers({}, { page: 1, limit: 1000 });
            if (trailers && trailers.data) {
                for (const trailer of trailers.data) {
                    const dueCheck = await this.checkDueMaintenance('Trailer', trailer._id, autoCreate);
                    if (dueCheck.hasDueMaintenance) {
                        allDue.push({
                            vehicleType: 'Trailer',
                            ...dueCheck
                        });
                        if (autoCreate && dueCheck.createdRecords) {
                            totalCreated += dueCheck.createdRecords.length;
                        }
                    }
                }
            }
        } catch (error) {
            console.log('Trailer service not available yet');
        }

        try {
            const tires = await tireService.getAllTires({}, { page: 1, limit: 1000 });
            if (tires && tires.tires) {
                for (const tire of tires.tires) {
                    const dueCheck = await this.checkDueMaintenance('Tire', tire._id, autoCreate);
                    if (dueCheck.hasDueMaintenance) {
                        allDue.push({
                            vehicleType: 'Tire',
                            ...dueCheck
                        });
                        if (autoCreate && dueCheck.createdRecords) {
                            totalCreated += dueCheck.createdRecords.length;
                        }
                    }
                }
            }
        } catch (error) {
            console.log('Tire check skipped');
        }

        return {
            allDue,
            totalDue: allDue.length,
            totalCreated: autoCreate ? totalCreated : undefined
        };
    }

    async getUpcomingMaintenance(days = 30) {
        return await MaintenanceRecord.getUpcomingMaintenance(days);
    }

    async getOverdueMaintenance() {
        return await MaintenanceRecord.getOverdueMaintenance();
    }

    async getMaintenanceStatistics(filters = {}) {
        const { startDate, endDate, vehicleType, maintenanceType } = filters;

        const matchStage = {};
        if (startDate || endDate) {
            matchStage.date = {};
            if (startDate) matchStage.date.$gte = new Date(startDate);
            if (endDate) matchStage.date.$lte = new Date(endDate);
        }
        if (vehicleType) matchStage.vehicleType = vehicleType;
        if (maintenanceType) matchStage.maintenanceType = maintenanceType;

        const [costStats, typeStats, statusStats, totalRecords] = await Promise.all([
            MaintenanceRecord.aggregate([
                { $match: matchStage },
                {
                    $group: {
                        _id: null,
                        totalCost: { $sum: '$cost' },
                        averageCost: { $avg: '$cost' },
                        minCost: { $min: '$cost' },
                        maxCost: { $max: '$cost' }
                    }
                }
            ]),

            MaintenanceRecord.aggregate([
                { $match: matchStage },
                {
                    $group: {
                        _id: '$maintenanceType',
                        count: { $sum: 1 },
                        totalCost: { $sum: '$cost' }
                    }
                },
                { $sort: { count: -1 } }
            ]),

            MaintenanceRecord.aggregate([
                { $match: matchStage },
                {
                    $group: {
                        _id: '$status',
                        count: { $sum: 1 }
                    }
                }
            ]),

            MaintenanceRecord.countDocuments(matchStage)
        ]);

        return {
            totalRecords,
            costSummary: costStats[0] || {
                totalCost: 0,
                averageCost: 0,
                minCost: 0,
                maxCost: 0
            },
            byType: typeStats,
            byStatus: statusStats,
            filters
        };
    }

    async getVehicleMaintenanceCost(vehicleType, vehicleId, filters = {}) {
        await this.validateVehicleExists(vehicleType, vehicleId);

        const matchStage = { vehicleType, vehicleId };
        if (filters.startDate || filters.endDate) {
            matchStage.date = {};
            if (filters.startDate) matchStage.date.$gte = new Date(filters.startDate);
            if (filters.endDate) matchStage.date.$lte = new Date(filters.endDate);
        }

        const stats = await MaintenanceRecord.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: null,
                    totalCost: { $sum: '$cost' },
                    averageCost: { $avg: '$cost' },
                    maintenanceCount: { $sum: 1 }
                }
            }
        ]);

        return stats[0] || {
            totalCost: 0,
            averageCost: 0,
            maintenanceCount: 0
        };
    }

    async validateVehicleExists(vehicleType, vehicleId) {
        let vehicle;
        
        switch (vehicleType) {
            case 'Truck':
                vehicle = await truckService.getTruckById(vehicleId);
                break;
            case 'Trailer':
                vehicle = await trailerService.getTrailerById(vehicleId);
                break;
            case 'Tire':
                vehicle = await tireService.getTireById(vehicleId);
                break;
            default:
                throw new Error('Invalid vehicle type');
        }

        if (!vehicle) {
            throw new Error(`${vehicleType} not found`);
        }

        return vehicle;
    }

    async getVehicle(vehicleType, vehicleId) {
        return await this.validateVehicleExists(vehicleType, vehicleId);
    }

    async getLastMaintenanceForEachType(vehicleType, vehicleId) {
        const records = await MaintenanceRecord.find({
            vehicleType,
            vehicleId,
            status: 'Completed'
        }).sort('-date');

        const lastMaintenanceMap = new Map();
        
        for (const record of records) {
            if (!lastMaintenanceMap.has(record.maintenanceType)) {
                lastMaintenanceMap.set(record.maintenanceType, record);
            }
        }

        return lastMaintenanceMap;
    }
}

export default new MaintenanceService();
