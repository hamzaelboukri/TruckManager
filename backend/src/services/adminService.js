import Admin from '../models/Admin.js';
import User from '../models/User.js';
import Truck from '../models/Truck.js';
import Trailer from '../models/Trailer.js';
import mongoose from 'mongoose';

class AdminService {

  async createAdmin(userData) {
    const exists = await User.findOne({ email: userData.email });
    if (exists) {
      throw new Error('Email already exists');
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const user = await User.create(
        [{ ...userData, role: 'Admin' }],
        { session }
      );

      const admin = await Admin.create(
        [{ user: user[0]._id }],
        { session }
      );

      await session.commitTransaction();
      return Admin.findById(admin[0]._id).populate('user');

    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      session.endSession();
    }
  }

  async getAdminById(adminId) {
    const admin = await Admin.findById(adminId).populate('user');
    if (!admin) throw new Error('Admin not found');
    return admin;
  }

  async getAllAdmins() {
    return Admin.find().populate('user');
  }

  async deleteAdmin(adminId) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const admin = await Admin.findById(adminId).session(session);
      if (!admin) throw new Error('Admin not found');

      await User.findByIdAndDelete(admin.user).session(session);
      await Admin.findByIdAndDelete(adminId).session(session);

      await session.commitTransaction();
      return admin;

    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      session.endSession();
    }
  }

  async createTruck(adminId, truckData) {
    const admin = await Admin.findById(adminId);
    if (!admin) throw new Error('Admin not found');

    return Truck.create(truckData);
  }

  async createTrailer(adminId, trailerData) {
    const admin = await Admin.findById(adminId);
    if (!admin) throw new Error('Admin not found');

    return Trailer.create(trailerData);
  }
}

export default new AdminService();
