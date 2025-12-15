import MaintenanceRule from '../models/MaintenanceRule.js';
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
}

export default new MaintenanceRuleService();
