import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import config from '../config/config.js';

class UserService {
  async createUser(userData) {
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    const user = await User.create(userData);
    return user;
  }

  async getUserById(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  async getUserByEmail(email) {
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  async updateUser(userId, updateData) {
    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  async deleteUser(userId) {
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  async getAllUsers(filters = {}) {
    const users = await User.find(filters);
    return users;
  }

  async login(email, password) {
    const user = await this.getUserByEmail(email);

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );

    return {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    };
  }

  async verifyToken(token) {
    try {
      const decoded = jwt.verify(token, config.jwt.secret);
      return decoded;
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }
}

export default new UserService();
