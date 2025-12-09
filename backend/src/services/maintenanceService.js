import MaintenanceRule from '../models/MaintenanceRule.js';
import Truck from '../models/Truck.js';
import Trailer from '../models/Trailer.js';

class MaintenanceService {
  async createMaintenanceRule(ruleData) {
    const ownerModel = ruleData.vehicleType === 'Truck' ? Truck : Trailer;
    const vehicle = await ownerModel.findById(ruleData.vehicleId);
    
    if (!vehicle) {
      throw new Error(`${ruleData.vehicleType} not found`);
    }

    const rule = await MaintenanceRule.createRule(ruleData);
    return rule;
  }

  async getMaintenanceRuleById(ruleId) {
    const rule = await MaintenanceRule.findById(ruleId).populate('vehicleId');
    if (!rule) {
      throw new Error('Maintenance rule not found');
    }
    return rule;
  }

  async getAllMaintenanceRules(filters = {}) {
    const rules = await MaintenanceRule.find(filters).populate('vehicleId');
    return rules;
  }

  async getMaintenanceRulesByVehicle(vehicleId, vehicleType) {
    const rules = await MaintenanceRule.find({ 
      vehicleId, 
      vehicleType 
    });
    return rules;
  }

  async getMaintenanceRulesByType(maintenanceType) {
    const rules = await MaintenanceRule.find({ 
      maintenanceType 
    }).populate('vehicleId');
    return rules;
  }

  async getActiveRules() {
    const rules = await MaintenanceRule.find({ 
      isActive: true 
    }).populate('vehicleId');
    return rules;
  }

  async updateMaintenanceRule(ruleId, updateData) {
    const rule = await MaintenanceRule.findByIdAndUpdate(
      ruleId,
      updateData,
      { new: true, runValidators: true }
    ).populate('vehicleId');
    
    if (!rule) {
      throw new Error('Maintenance rule not found');
    }
    return rule;
  }

  async deleteMaintenanceRule(ruleId) {
    const rule = await MaintenanceRule.findByIdAndDelete(ruleId);
    if (!rule) {
      throw new Error('Maintenance rule not found');
    }
    return rule;
  }

  async deactivateRule(ruleId) {
    const rule = await MaintenanceRule.findByIdAndUpdate(
      ruleId,
      { isActive: false },
      { new: true }
    );
    
    if (!rule) {
      throw new Error('Maintenance rule not found');
    }
    return rule;
  }

  async checkIfMaintenanceDue(ruleId) {
    const rule = await MaintenanceRule.findById(ruleId);
    if (!rule) {
      throw new Error('Maintenance rule not found');
    }

    return await rule.isDue();
  }

  async getAllDueMaintenances() {
    const rules = await MaintenanceRule.find({ isActive: true });
    const dueMaintenances = [];

    for (const rule of rules) {
      const result = await rule.isDue();
      if (result.isDue) {
        dueMaintenances.push({
          rule: rule,
          ...result
        });
      }
    }

    return dueMaintenances;
  }
}

export default new MaintenanceService();
