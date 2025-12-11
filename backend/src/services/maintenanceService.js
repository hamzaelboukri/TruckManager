import MaintenanceRule from '../models/MaintenanceRule.js';
import MaintenanceRecord from '../models/MaintenanceRecord.js';
import truckService from './truckService.js';
import trailerService from './trailerService.js';
import tireService from './tireService.js';

class MaintenanceService {
    // ============ MAINTENANCE RULES ============
    
    /**
     * Créer une nouvelle règle de maintenance
     */
    async createRule(ruleData) {
        // Vérifier que le véhicule existe
        if (ruleData.vehicleId) {
            await this.validateVehicleExists(ruleData.vehicleType, ruleData.vehicleId);
        }

        const rule = await MaintenanceRule.create(ruleData);
        await rule.populate('vehicleId');
        return rule;
    }

    /**
     * Obtenir toutes les règles de maintenance
     */
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

    /**
     * Obtenir une règle par ID
     */
    async getRuleById(ruleId) {
        const rule = await MaintenanceRule.findById(ruleId).populate('vehicleId');
        if (!rule) {
            throw new Error('Maintenance rule not found');
        }
        return rule;
    }

    /**
     * Obtenir les règles pour un véhicule spécifique
     */
    async getRulesByVehicle(vehicleType, vehicleId) {
        await this.validateVehicleExists(vehicleType, vehicleId);

        const rules = await MaintenanceRule.find({
            vehicleType,
            vehicleId,
            isActive: true
        }).sort('-createdAt');

        return rules;
    }

    /**
     * Mettre à jour une règle de maintenance
     */
    async updateRule(ruleId, updateData) {
        const rule = await MaintenanceRule.findById(ruleId);
        if (!rule) {
            throw new Error('Maintenance rule not found');
        }

        // Si le véhicule change, vérifier qu'il existe
        if (updateData.vehicleId && updateData.vehicleType) {
            await this.validateVehicleExists(updateData.vehicleType, updateData.vehicleId);
        }

        Object.assign(rule, updateData);
        await rule.save();
        await rule.populate('vehicleId');
        
        return rule;
    }

    /**
     * Supprimer une règle de maintenance
     */
    async deleteRule(ruleId) {
        const rule = await MaintenanceRule.findByIdAndDelete(ruleId);
        if (!rule) {
            throw new Error('Maintenance rule not found');
        }
        return rule;
    }

    /**
     * Activer/Désactiver une règle
     */
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

    // ============ MAINTENANCE RECORDS ============
    
    /**
     * Créer un enregistrement de maintenance
     */
    async createRecord(recordData) {
        await this.validateVehicleExists(recordData.vehicleType, recordData.vehicleId);

        const record = await MaintenanceRecord.create(recordData);
        await record.populate(['vehicleId', { path: 'createdBy', select: 'name email' }]);
        
        return record;
    }

    /**
     * Obtenir tous les enregistrements de maintenance
     */
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

    /**
     * Obtenir un enregistrement par ID
     */
    async getRecordById(recordId) {
        const record = await MaintenanceRecord.findById(recordId)
            .populate('vehicleId')
            .populate('createdBy', 'name email');
            
        if (!record) {
            throw new Error('Maintenance record not found');
        }
        return record;
    }

    /**
     * Obtenir l'historique de maintenance d'un véhicule
     */
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

    /**
     * Mettre à jour un enregistrement de maintenance
     */
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

    /**
     * Compléter une maintenance
     */
    async completeRecord(recordId, completionData) {
        const record = await MaintenanceRecord.findById(recordId);
        if (!record) {
            throw new Error('Maintenance record not found');
        }

        await record.complete(completionData);
        await record.populate(['vehicleId', { path: 'createdBy', select: 'name email' }]);
        
        return record;
    }

    /**
     * Annuler une maintenance
     */
    async cancelRecord(recordId, reason) {
        const record = await MaintenanceRecord.findById(recordId);
        if (!record) {
            throw new Error('Maintenance record not found');
        }

        await record.cancel(reason);
        await record.populate(['vehicleId', { path: 'createdBy', select: 'name email' }]);
        
        return record;
    }

    /**
     * Supprimer un enregistrement
     */
    async deleteRecord(recordId) {
        const record = await MaintenanceRecord.findByIdAndDelete(recordId);
        if (!record) {
            throw new Error('Maintenance record not found');
        }
        return record;
    }

    // ============ VÉRIFICATION ET NOTIFICATIONS ============
    
    /**
     * Vérifier les maintenances dues pour un véhicule
     */
    async checkDueMaintenance(vehicleType, vehicleId) {
        await this.validateVehicleExists(vehicleType, vehicleId);

        // Récupérer le véhicule avec ses kilomètres actuels
        const vehicle = await this.getVehicle(vehicleType, vehicleId);
        
        // Récupérer toutes les règles actives pour ce véhicule
        const rules = await MaintenanceRule.find({
            vehicleType,
            vehicleId,
            isActive: true
        });

        // Récupérer le dernier enregistrement de maintenance pour chaque type
        const lastMaintenances = await this.getLastMaintenanceForEachType(vehicleType, vehicleId);

        const dueMaintenances = [];

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
            }
        }

        return {
            vehicle: vehicle.toObject(),
            dueMaintenances,
            hasDueMaintenance: dueMaintenances.length > 0
        };
    }

    /**
     * Vérifier toutes les maintenances dues
     */
    async checkAllDueMaintenance() {
        const allDue = [];

        const trucks = await truckService.getAllTrucks({}, { page: 1, limit: 1000 });
        for (const truck of trucks.trucks) {
            const dueCheck = await this.checkDueMaintenance('Truck', truck._id);
            if (dueCheck.hasDueMaintenance) {
                allDue.push({
                    vehicleType: 'Truck',
                    ...dueCheck
                });
            }
        }

        try {
            const trailers = await trailerService.getAllTrailers({}, { page: 1, limit: 1000 });
            if (trailers && trailers.trailers) {
                for (const trailer of trailers.trailers) {
                    const dueCheck = await this.checkDueMaintenance('Trailer', trailer._id);
                    if (dueCheck.hasDueMaintenance) {
                        allDue.push({
                            vehicleType: 'Trailer',
                            ...dueCheck
                        });
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
                    const dueCheck = await this.checkDueMaintenance('Tire', tire._id);
                    if (dueCheck.hasDueMaintenance) {
                        allDue.push({
                            vehicleType: 'Tire',
                            ...dueCheck
                        });
                    }
                }
            }
        } catch (error) {
            console.log('Tire check skipped');
        }

        return allDue;
    }

    /**
     * Obtenir les maintenances à venir
     */
    async getUpcomingMaintenance(days = 30) {
        return await MaintenanceRecord.getUpcomingMaintenance(days);
    }

    /**
     * Obtenir les maintenances en retard
     */
    async getOverdueMaintenance() {
        return await MaintenanceRecord.getOverdueMaintenance();
    }

    // ============ STATISTIQUES ============
    
    /**
     * Obtenir les statistiques de maintenance
     */
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
            // Statistiques de coûts
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

            // Statistiques par type
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

            // Statistiques par statut
            MaintenanceRecord.aggregate([
                { $match: matchStage },
                {
                    $group: {
                        _id: '$status',
                        count: { $sum: 1 }
                    }
                }
            ]),

            // Total d'enregistrements
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

    /**
     * Obtenir le coût total de maintenance d'un véhicule
     */
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

    // ============ MÉTHODES UTILITAIRES ============
    
    /**
     * Valider qu'un véhicule existe
     */
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

    /**
     * Récupérer un véhicule
     */
    async getVehicle(vehicleType, vehicleId) {
        return await this.validateVehicleExists(vehicleType, vehicleId);
    }

    /**
     * Obtenir la dernière maintenance pour chaque type
     */
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
