import Admin from '../models/Admin.js';
import User from '../models/User.js';

class AdminService {
  async createAdmin(userData) {
    const user = await User.create({ ...userData, role: 'Admin' });
    
    const admin = await Admin.create({
      user: user._id
    });

    return await admin.populate('user');
  }

  async getAdminById(adminId) {
    const admin = await Admin.findById(adminId).populate('user');
    if (!admin) {
      throw new Error('Admin not found');
    }
    return admin;
  }

  async getAllAdmins() {
    const admins = await Admin.find().populate('user');
    return admins;
  }

  async deleteAdmin(adminId) {
    const admin = await Admin.findById(adminId);
    if (!admin) {
      throw new Error('Admin not found');
    }

    await User.findByIdAndDelete(admin.user);
    await Admin.findByIdAndDelete(adminId);
    
    return admin;
  }

  async createTruck(adminId, truckData) {
    const admin = await Admin.findById(adminId);
    if (!admin) {
      throw new Error('Admin not found');
    }

    return await admin.createTruck(truckData);
  }

  async createTrailer(adminId, trailerData) {
    const admin = await Admin.findById(adminId);
    if (!admin) {
      throw new Error('Admin not found');
    }

    return await admin.createTrailer(trailerData);
  }
}

export default new AdminService();
