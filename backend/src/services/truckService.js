import Truck from '../models/Truck.js';

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
    const truck = await Truck.findById(truckId)
      .populate('routes')
      .populate('maintenanceRecords');
    
    if (!truck) {
      throw new Error('Truck not found');
    }
    return truck;
  }

  async getAllTrucks(filters = {}) {
    const trucks = await Truck.find(filters);
    return trucks;
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
}

export default new TruckService();
