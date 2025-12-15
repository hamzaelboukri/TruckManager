import MaintenanceRule from '../models/MaintenanceRule.js';
import MaintenanceRecord from '../models/MaintenanceRecord.js';
import truckService from './truckService.js';
import trailerService from './trailerService.js';
import tireService from './tireService.js';

class MaintenanceRuleService {
    async createRule(ruleData) {
        if (ruleData.vehicleId) {
            await this.validateVehicleExists(ruleData.vehicleType, ruleData.vehicleId);
        }

        const rule = await MaintenanceRule.create(ruleData);
        await rule.populate('vehicleId');
        
        if (rule.isActive) {
            await this.checkAndCreateMaintenanceForRule(rule);
        }
        
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

    async checkAndCreateMaintenanceForRule(rule) {
        let vehicles = [];
        const createdMaintenances = [];
        
        if (rule.vehicleId) {
            const vehicle = await this.validateVehicleExists(rule.vehicleType, rule.vehicleId);
            vehicles = [vehicle];
        } else {
            switch (rule.vehicleType) {
                case 'Truck':
                    const trucks = await truckService.getAllTrucks();
                    vehicles = trucks.data || trucks;
                    break;
                case 'Trailer':
                    const trailers = await trailerService.getAllTrailers();
                    vehicles = trailers.data || trailers;
                    break;
                case 'Tire':
                    const tires = await tireService.getAllTires();
                    vehicles = tires.data || tires;
                    break;
            }
        }

        for (const vehicle of vehicles) {
            const lastMaintenance = await MaintenanceRecord.findOne({
                vehicleType: rule.vehicleType,
                vehicleId: vehicle._id,
                maintenanceType: rule.maintenanceType
            }).sort({ scheduledDate: -1 });

            let lastMaintenanceKm = 0;
            let lastMaintenanceDate = null;

            if (lastMaintenance) {
                lastMaintenanceKm = lastMaintenance.currentKilometers || 0;
                lastMaintenanceDate = lastMaintenance.completedDate || lastMaintenance.scheduledDate;
            }

            const currentKm = vehicle.kilometers || vehicle.mileage || 0;
            const { isDue, reason, urgency } = rule.isDue(currentKm, lastMaintenanceKm, lastMaintenanceDate);

            if (isDue) {
                const existingPending = await MaintenanceRecord.findOne({
                    vehicleType: rule.vehicleType,
                    vehicleId: vehicle._id,
                    maintenanceType: rule.maintenanceType,
                    status: { $in: ['Pending', 'InProgress'] }
                });

                if (!existingPending) {
                    let priority = 'Low';
                    if (urgency === 'Urgent') priority = 'High';
                    else if (urgency === 'Soon') priority = 'Medium';

                    const newMaintenance = await MaintenanceRecord.create({
                        vehicleType: rule.vehicleType,
                        vehicleId: vehicle._id,
                        maintenanceType: rule.maintenanceType,
                        description: `${rule.description} - ${reason}`,
                        scheduledDate: new Date(),
                        status: 'Pending',
                        priority,
                        estimatedCost: rule.estimatedCost || 0,
                        currentKilometers: currentKm,
                        notes: `Créé automatiquement par la règle: ${rule.description}. ${reason}`
                    });

                    createdMaintenances.push(newMaintenance);
                }
            }
        }

        return createdMaintenances;
    }

    async checkAllRulesAndCreateMaintenances() {
        const rules = await MaintenanceRule.find({ isActive: true });
        let totalCreated = 0;
        const allCreated = [];

        for (const rule of rules) {
            const created = await this.checkAndCreateMaintenanceForRule(rule);
            totalCreated += created.length;
            allCreated.push(...created);
        }

        return {
            success: true,
            totalCreated,
            createdMaintenances: allCreated
        };
    }
}

export default new MaintenanceRuleService();
