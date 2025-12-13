import Driver from '../models/Driver.js';
import User from '../models/User.js';

class DriverService {
  async createDriver(userData, licenseNumber, licenseExpiryDate = null) {
    const user = await User.create({ ...userData, role: 'Driver' });

    const driver = await Driver.create({
      user: user._id,
      licenseNumber,
      ...(licenseExpiryDate && { licenseExpiryDate })
    });

    return await driver.populate('user');
  }

  async getDriverById(driverId) {
    const driver = await Driver.findById(driverId)
      .populate('user')
      .populate('assignedRoutes');

    if (!driver) {
      throw new Error('Driver not found');
    }
    return driver;
  }

  async getAllDrivers() {
    const drivers = await Driver.find().populate('user');
    return drivers;
  }

  async updateDriver(driverId, updateData) {
    const driver = await Driver.findByIdAndUpdate(
      driverId,
      updateData,
      { new: true, runValidators: true }
    ).populate('user');

    if (!driver) {
      throw new Error('Driver not found');
    }
    return driver;
  }

  async deleteDriver(driverId) {
    const driver = await Driver.findById(driverId);
    if (!driver) {
      throw new Error('Driver not found');
    }

    await User.findByIdAndDelete(driver.user);
    await Driver.findByIdAndDelete(driverId);

    return driver;
  }

  async getAssignedRoutes(driverId) {
    const driver = await Driver.findById(driverId);
    if (!driver) {
      throw new Error('Driver not found');
    }

    return await driver.viewAssignedRoutes();
  }

  async downloadRoutePDF(driverId, routeId) {
    const driver = await Driver.findById(driverId);
    if (!driver) {
      throw new Error('Driver not found');
    }

    return await driver.downloadRoutePDF(routeId);
  }
}

export default new DriverService();
