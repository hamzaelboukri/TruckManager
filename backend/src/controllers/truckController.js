import truckService from '../services/truckService.js';

export const getAllTrucks = async (req, res) => {
  try {
    const trucks = await truckService.getAllTrucks(req.query);
    
    res.status(200).json({
      success: true,
      count: trucks.length,
      data: trucks
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

export const getTruckById = async (req, res) => {
  try {
    const truck = await truckService.getTruckById(req.params.id);
    
    res.status(200).json({
      success: true,
      data: truck
    });
  } catch (error) {
    if (error.message === 'Truck not found') {
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

export const createTruck = async (req, res) => {
  try {
    const truck = await truckService.createTruck(req.body);
    
    res.status(201).json({
      success: true,
      data: truck
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

export const updateTruck = async (req, res) => {
  try {
    const truck = await truckService.updateTruck(req.params.id, req.body);
    
    res.status(200).json({
      success: true,
      data: truck
    });
  } catch (error) {
    if (error.message === 'Truck not found') {
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

export const deleteTruck = async (req, res) => {
  try {
    await truckService.deleteTruck(req.params.id);
    
    res.status(200).json({
      success: true,
      message: 'Truck deleted successfully',
      data: {}
    });
  } catch (error) {
    if (error.message === 'Truck not found') {
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

export const getTrucksByStatus = async (req, res) => {
  try {
    const trucks = await truckService.getTrucksByStatus(req.params.status);
    
    res.status(200).json({
      success: true,
      count: trucks.length,
      data: trucks
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
