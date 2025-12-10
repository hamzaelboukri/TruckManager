import tireService from '../services/tireService.js';

// Get all tires with pagination and filtering
export const getAllTires = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, ownerType, brand } = req.query;
    const skip = (page - 1) * limit;

    const filters = {};
    if (status) filters.status = status;
    if (ownerType) filters.ownerType = ownerType;
    if (brand) filters.brand = new RegExp(brand, 'i');

    const tires = await tireService.getAllTires(filters, skip, parseInt(limit));
    const total = await tireService.countTires(filters);

    res.status(200).json({
      success: true,
      data: tires,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching tires',
      error: error.message
    });
  }
};

// Get tire by ID
export const getTireById = async (req, res) => {
  try {
    const tire = await tireService.getTireById(req.params.id);
    res.status(200).json({
      success: true,
      data: tire
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
};

// Create new tire
export const createTire = async (req, res) => {
  try {
    const tire = await tireService.createTire(req.body);
    res.status(201).json({
      success: true,
      message: 'Tire created successfully',
      data: tire
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creating tire',
      error: error.message
    });
  }
};

// Update tire
export const updateTire = async (req, res) => {
  try {
    const tire = await tireService.updateTire(req.params.id, req.body);
    res.status(200).json({
      success: true,
      message: 'Tire updated successfully',
      data: tire
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating tire',
      error: error.message
    });
  }
};

// Delete tire
export const deleteTire = async (req, res) => {
  try {
    await tireService.deleteTire(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Tire deleted successfully'
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
};

// Get tires by status
export const getTiresByStatus = async (req, res) => {
  try {
    const tires = await tireService.getTiresByStatus(req.params.status);
    res.status(200).json({
      success: true,
      count: tires.length,
      data: tires
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching tires by status',
      error: error.message
    });
  }
};

// Get tires by vehicle (Truck or Trailer)
export const getTiresByVehicle = async (req, res) => {
  try {
    const { vehicleId, ownerType } = req.params;
    const tires = await tireService.getTiresByVehicle(vehicleId, ownerType);
    res.status(200).json({
      success: true,
      count: tires.length,
      data: tires
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching tires by vehicle',
      error: error.message
    });
  }
};

// Update tire wear (kilometers)
export const updateTireWear = async (req, res) => {
  try {
    const { newKilometers } = req.body;
    
    if (!newKilometers || newKilometers < 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid kilometers value is required'
      });
    }

    const tire = await tireService.updateWear(req.params.id, newKilometers);
    res.status(200).json({
      success: true,
      message: 'Tire wear updated successfully',
      data: tire
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Get tires needing replacement
export const getTiresNeedingReplacement = async (req, res) => {
  try {
    const tires = await tireService.getTiresNeedingReplacement();
    res.status(200).json({
      success: true,
      count: tires.length,
      data: tires
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching tires needing replacement',
      error: error.message
    });
  }
};

// Get tires with warning status
export const getTiresWithWarning = async (req, res) => {
  try {
    const tires = await tireService.getTiresWithWarning();
    res.status(200).json({
      success: true,
      count: tires.length,
      data: tires
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching tires with warning',
      error: error.message
    });
  }
};

// Get tire statistics
export const getTireStatistics = async (req, res) => {
  try {
    const statistics = await tireService.getTireStatistics();
    res.status(200).json({
      success: true,
      data: statistics
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching tire statistics',
      error: error.message
    });
  }
};

// Search tires by serial number or brand
export const searchTires = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const tires = await tireService.searchTires(query);
    res.status(200).json({
      success: true,
      count: tires.length,
      data: tires
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error searching tires',
      error: error.message
    });
  }
};
