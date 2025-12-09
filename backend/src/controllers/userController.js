import userService from '../services/userService.js';

export const getAllUsers = async (req, res) => {
  try {
    const users = await userService.getAllUsers(req.query);
    
    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await userService.getUserById(req.params.id);
    
    const { password: _, ...userWithoutPassword } = user.toObject();
    
    res.status(200).json({
      success: true,
      data: userWithoutPassword
    });
  } catch (error) {
    if (error.message === 'User not found') {
      return res.status(404).json({
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

export const createUser = async (req, res) => {
  try {
    const user = await userService.createUser(req.body);
    
    const { password: _, ...userWithoutPassword } = user.toObject();
    
    res.status(201).json({
      success: true,
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

export const updateUser = async (req, res) => {
  try {
    const user = await userService.updateUser(req.params.id, req.body);
    
    const { password: _, ...userWithoutPassword } = user.toObject();
    
    res.status(200).json({
      success: true,
      data: userWithoutPassword
    });
  } catch (error) {
    if (error.message === 'User not found') {
      return res.status(404).json({
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

export const deleteUser = async (req, res) => {
  try {
    await userService.deleteUser(req.params.id);
    
    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
      data: {}
    });
  } catch (error) {
    if (error.message === 'User not found') {
      return res.status(404).json({
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
