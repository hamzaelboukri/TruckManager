import userService from '../services/userService.js';
import driverService from '../services/driverService.js';

export const register = async (req, res) => {
  try {
    const { name, email, password, phone, role, licenseNumber } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        error: 'Please provide name, email, password, and role'
      });
    }

    // Check if Driver role requires licenseNumber
    if (role === 'Driver' && !licenseNumber) {
      return res.status(400).json({
        success: false,
        error: 'License number is required for Driver role'
      });
    }

    let result;
    if (role === 'Driver') {
      const driver = await driverService.createDriver(
        { name, email, password, phone },
        licenseNumber
      );
      result = {
        ...driver.user.toObject(),
        driverId: driver._id,
        licenseNumber: driver.licenseNumber
      };
    } else {
      // Create admin user
      const user = await userService.createUser({
        name,
        email,
        password,
        phone,
        role
      });
      result = user.toObject();
    }

    const { password: _, ...userWithoutPassword } = result;

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: userWithoutPassword
    });
  } catch (error) {
    if (error.message.includes('already exists')) {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide email and password'
      });
    }

    const result = await userService.login(email, password);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: result
    });
  } catch (error) {
    if (error.message === 'Invalid credentials' || error.message === 'User not found') {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

export const logout = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await userService.getUserById(req.user.userId);

    const { password: _, ...userWithoutPassword } = user.toObject();

    res.status(200).json({
      success: true,
      data: userWithoutPassword
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { password, role, ...updateData } = req.body;

    const user = await userService.updateUser(req.user.userId, updateData);

    const { password: _, ...userWithoutPassword } = user.toObject();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: userWithoutPassword
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Please provide current and new password'
      });
    }

    const user = await userService.getUserByEmail(req.user.email);
    
    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Current password is incorrect'
      });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

export const verifyToken = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'No token provided'
      });
    }

    const decoded = await userService.verifyToken(token);

    res.status(200).json({
      success: true,
      data: decoded
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      error: error.message
    });
  }
};
