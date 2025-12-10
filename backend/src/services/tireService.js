import Tire from '../models/Tire.js';
import Truck from '../models/Truck.js';
import Trailer from '../models/Trailer.js';

class TireService {
  async createTire(tireData) {
    const existingTire = await Tire.findOne({
      serialNumber: tireData.serialNumber
    });

    if (existingTire) {
      throw new Error('Tire with this serial number already exists');
    }

    const truckModel = tireData.ownerType === 'Truck' ? Truck : Trailer;
    const truckOrTrailer = await truckModel.findById(tireData.vehicle);

    if (!truckOrTrailer) {
      throw new Error(`${tireData.ownerType} not found`);
    }

    const tire = await Tire.create(tireData);
    return await tire.populate('vehicle');
  }

  async getTireById(tireId) {
    const tire = await Tire.findById(tireId).populate('vehicle');
    if (!tire) {
      throw new Error('Tire not found');
    }
    return tire;
  }

  async getAllTires(filters = {}, skip = 0, limit = 10) {
    const tires = await Tire.find(filters)
      .populate('vehicle')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
    return tires;
  }

  async countTires(filters = {}) {
    return await Tire.countDocuments(filters);
  }

  async getTiresByVehicle(vehicleId, ownerType) {
    const tires = await Tire.find({
      vehicle: vehicleId,
      ownerType
    }).populate('vehicle');
    return tires;
  }

  async getTiresByStatus(status) {
    const tires = await Tire.find({ status }).populate('vehicle');
    return tires;
  }

  async updateTire(tireId, updateData) {
    const tire = await Tire.findByIdAndUpdate(
      tireId,
      updateData,
      { new: true, runValidators: true }
    ).populate('vehicle');

    if (!tire) {
      throw new Error('Tire not found');
    }
    return tire;
  }

  async deleteTire(tireId) {
    const tire = await Tire.findByIdAndDelete(tireId);
    if (!tire) {
      throw new Error('Tire not found');
    }
    return tire;
  }

  async updateWear(tireId, newKilometers) {
    const tire = await Tire.findById(tireId);
    if (!tire) {
      throw new Error('Tire not found');
    }

    await tire.updateWear(newKilometers);
    return tire;
  }

  async getTiresNeedingReplacement() {
    const tires = await Tire.find({
      status: 'NeedReplacement'
    }).populate('vehicle');
    return tires;
  }

  async getTiresWithWarning() {
    const tires = await Tire.find({
      status: 'Warning'
    }).populate('vehicle');
    return tires;
  }

  async getTireStatistics() {
    const total = await Tire.countDocuments();
    const byStatus = await Tire.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const byOwnerType = await Tire.aggregate([
      {
        $group: {
          _id: '$ownerType',
          count: { $sum: 1 }
        }
      }
    ]);

    const averageWear = await Tire.aggregate([
      {
        $group: {
          _id: null,
          avgWear: { $avg: '$wearPercentage' }
        }
      }
    ]);

    return {
      total,
      byStatus: byStatus.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      byOwnerType: byOwnerType.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      averageWear: averageWear[0]?.avgWear || 0
    };
  }

  async searchTires(query) {
    const tires = await Tire.find({
      $or: [
        { serialNumber: new RegExp(query, 'i') },
        { brand: new RegExp(query, 'i') }
      ]
    }).populate('vehicle');
    return tires;
  }
}

export default new TireService();
