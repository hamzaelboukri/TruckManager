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

    const ownerModel = tireData.ownerType === 'Truck' ? Truck : Trailer;
    const owner = await ownerModel.findById(tireData.owner);
    
    if (!owner) {
      throw new Error(`${tireData.ownerType} not found`);
    }

    const tire = await Tire.create(tireData);
    return await tire.populate('owner');
  }

  async getTireById(tireId) {
    const tire = await Tire.findById(tireId).populate('owner');
    if (!tire) {
      throw new Error('Tire not found');
    }
    return tire;
  }

  async getAllTires(filters = {}) {
    const tires = await Tire.find(filters).populate('owner');
    return tires;
  }

  async getTiresByOwner(ownerId, ownerType) {
    const tires = await Tire.find({ 
      owner: ownerId, 
      ownerType 
    });
    return tires;
  }

  async getTiresByStatus(status) {
    const tires = await Tire.find({ status }).populate('owner');
    return tires;
  }

  async updateTire(tireId, updateData) {
    const tire = await Tire.findByIdAndUpdate(
      tireId,
      updateData,
      { new: true, runValidators: true }
    ).populate('owner');
    
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
    }).populate('owner');
    return tires;
  }

  async getTiresWithWarning() {
    const tires = await Tire.find({ 
      status: 'Warning' 
    }).populate('owner');
    return tires;
  }
}

export default new TireService();
