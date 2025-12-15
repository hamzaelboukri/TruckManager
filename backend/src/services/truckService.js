import Truck from '../models/Truck.js';
import maintenanceRuleService from './maintenanceRuleService.js';

class TruckService {
  async createTruck(truckData) {
    const existingTruck = await Truck.findOne({
      registrationNumber: truckData.registrationNumber
    });

    if (existingTruck) {
      throw new Error('Truck with this registration number already exists');
    }

    const truck = await Truck.create(truckData);
    return truck;
  }

  async getTruckById(truckId) {
    const truck = await Truck.findById(truckId);

    if (!truck) {
      throw new Error('Truck not found');
    }
    return truck;
  }

  async getAllTrucks(filters = {}, options = {}) {
    const { page = 1, limit = 10, sort = '-createdAt' } = options;
    
    const skip = (page - 1) * limit;
    
    const trucks = await Truck.find(filters)
      .sort(sort)
      .skip(skip)
      .limit(limit);
    
    const total = await Truck.countDocuments(filters);
    
    return {
      trucks,
      total,
      page,
      pages: Math.ceil(total / limit)
    };
  }

  async getTrucksByStatus(status) {
    const trucks = await Truck.find({ status });
    return trucks;
  }

  async updateTruck(truckId, updateData) {
    const truck = await Truck.findByIdAndUpdate(
      truckId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!truck) {
      throw new Error('Truck not found');
    }

    // Check maintenance rules for this truck after update
    try {
      console.log(`Checking maintenance rules for truck ${truckId}`);
      const rules = await maintenanceRuleService.getRulesByVehicle('Truck', truckId);
      console.log(`Found ${rules.length} active rules for this truck`);
      for (const rule of rules) {
        console.log(`Checking rule: ${rule.maintenanceType} - ${rule.description}`);
        const created = await maintenanceRuleService.checkAndCreateMaintenanceForRule(rule);
        console.log(`Created ${created.length} maintenance records from this rule`);
      }
    } catch (error) {
      console.log('Error checking maintenance rules:', error.message);
      console.error(error);
    }

    return truck;
  }

  async deleteTruck(truckId) {
    const truck = await Truck.findByIdAndDelete(truckId);
    if (!truck) {
      throw new Error('Truck not found');
    }
    return truck;
  }

  async updateKilometers(truckId, kilometers) {
    const truck = await Truck.findById(truckId);
    if (!truck) {
      throw new Error('Truck not found');
    }

    await truck.updateKilometers(kilometers);

    // Check maintenance rules after updating kilometers
    try {
      console.log(`Checking maintenance rules after updating kilometers for truck ${truckId}`);
      const rules = await maintenanceRuleService.getRulesByVehicle('Truck', truckId);
      console.log(`Found ${rules.length} active rules for this truck`);
      for (const rule of rules) {
        console.log(`Checking rule: ${rule.maintenanceType} - ${rule.description}`);
        const created = await maintenanceRuleService.checkAndCreateMaintenanceForRule(rule);
        console.log(`Created ${created.length} maintenance records from this rule`);
      }
    } catch (error) {
      console.log('Error checking maintenance rules:', error.message);
      console.error(error);
    }

    return truck;
  }

  async updateStatus(truckId, status) {
    const validStatuses = ['Available', 'InRoute', 'Maintenance', 'OutOfService'];
    if (!validStatuses.includes(status)) {
      throw new Error('Invalid status');
    }

    const truck = await Truck.findByIdAndUpdate(
      truckId,
      { status },
      { new: true }
    );

    if (!truck) {
      throw new Error('Truck not found');
    }
    return truck;
  }

  async getAvailableTrucks() {
    return await Truck.find({ status: 'Available' });
  }

  async getTruckStatistics() {
    const totalTrucks = await Truck.countDocuments();
    const availableTrucks = await Truck.countDocuments({ status: 'Available' });
    const inRouteTrucks = await Truck.countDocuments({ status: 'InRoute' });
    const maintenanceTrucks = await Truck.countDocuments({ status: 'Maintenance' });
    const outOfServiceTrucks = await Truck.countDocuments({ status: 'OutOfService' });

    const avgKilometers = await Truck.aggregate([
      {
        $group: {
          _id: null,
          averageKilometers: { $avg: '$currentKilometers' }
        }
      }
    ]);

    return {
      total: totalTrucks,
      byStatus: {
        available: availableTrucks,
        inRoute: inRouteTrucks,
        maintenance: maintenanceTrucks,
        outOfService: outOfServiceTrucks
      },
      averageKilometers: avgKilometers.length > 0 ? Math.round(avgKilometers[0].averageKilometers) : 0
    };
  }

  async searchTrucks(query) {
    const searchRegex = new RegExp(query, 'i');
    
    const trucks = await Truck.find({
      $or: [
        { registrationNumber: searchRegex },
        { model: searchRegex }
      ]
    });

    return trucks;
  }
}

export default new TruckService();
