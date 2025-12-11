import routeService from '../services/routeService.js';

export const getAllRoutes = async (req, res) => {
  try {
    const { page = 1, limit = 10, sort = '-createdAt', status, driver, truck } = req.query;

    const filters = {};
    if (status) filters.status = status;
    if (driver) filters.driver = driver;
    if (truck) filters.truck = truck;

    const options = { page: parseInt(page), limit: parseInt(limit), sort };

    const result = await routeService.getAllRoutes(filters, options);

    res.status(200).json({
      success: true,
      data: result.routes,
      pagination: {
        page: result.page,
        limit: parseInt(limit),
        total: result.total,
        pages: result.pages
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching routes',
      error: error.message
    });
  }
};

export const getRouteById = async (req, res) => {
  try {
    const route = await routeService.getRouteById(req.params.id);
    res.status(200).json({
      success: true,
      data: route
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
};

// Create new route (Admin only)
export const createRoute = async (req, res) => {
  try {
    const route = await routeService.createRoute(req.body);
    res.status(201).json({
      success: true,
      message: 'Route created successfully',
      data: route
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creating route',
      error: error.message
    });
  }
};

// Update route (Admin only)
export const updateRoute = async (req, res) => {
  try {
    const route = await routeService.updateRoute(req.params.id, req.body);
    res.status(200).json({
      success: true,
      message: 'Route updated successfully',
      data: route
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating route',
      error: error.message
    });
  }
};

// Update route progress (Driver can update own route progress)
export const updateRouteProgress = async (req, res) => {
  try {
    const route = await routeService.getRouteById(req.params.id);

    // Check if driver owns this route
    if (req.user.role === 'Driver' && route.driver._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own routes'
      });
    }

    const { departureKilometers, arrivalKilometers, fuelVolume, fuelCost, vehicleRemarks } = req.body;

    // Build update object with only provided fields
    const updateData = {};
    if (departureKilometers !== undefined) updateData.departureKilometers = departureKilometers;
    if (arrivalKilometers !== undefined) updateData.arrivalKilometers = arrivalKilometers;
    if (fuelVolume !== undefined) updateData.fuelVolume = fuelVolume;
    if (fuelCost !== undefined) updateData.fuelCost = fuelCost;
    if (vehicleRemarks !== undefined) updateData.vehicleRemarks = vehicleRemarks;

    const updatedRoute = await routeService.updateRoute(req.params.id, updateData);

    res.status(200).json({
      success: true,
      message: 'Route progress updated successfully',
      data: updatedRoute
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating route progress',
      error: error.message
    });
  }
};

// Delete route (Admin only)
export const deleteRoute = async (req, res) => {
  try {
    await routeService.deleteRoute(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Route deleted successfully'
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
};

// Start route (Admin or assigned Driver)
export const startRoute = async (req, res) => {
  try {
    const { departureKilometers } = req.body;

    if (!departureKilometers || departureKilometers < 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid departure kilometers are required'
      });
    }

    const route = await routeService.startRoute(req.params.id, departureKilometers);

    res.status(200).json({
      success: true,
      message: 'Route started successfully',
      data: route
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Complete route (Admin or assigned Driver)
export const completeRoute = async (req, res) => {
  try {
    const { arrivalKilometers, fuelVolume, fuelCost, vehicleRemarks } = req.body;

    if (!arrivalKilometers || arrivalKilometers <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid arrival kilometers are required'
      });
    }

    const route = await routeService.completeRoute(req.params.id, {
      arrivalKilometers,
      fuelVolume,
      fuelCost,
      vehicleRemarks
    });

    res.status(200).json({
      success: true,
      message: 'Route completed successfully. Truck, trailer, and tires updated.',
      data: route
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Get routes by status
export const getRoutesByStatus = async (req, res) => {
  try {
    const routes = await routeService.getRoutesByStatus(req.params.status);
    res.status(200).json({
      success: true,
      count: routes.length,
      data: routes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching routes by status',
      error: error.message
    });
  }
};

// Get routes by driver (Driver can see own routes, Admin can see all)
export const getRoutesByDriver = async (req, res) => {
  try {
    const { driverId } = req.params;

    // If user is a driver, only allow viewing own routes
    if (req.user.role === 'Driver' && req.user.id !== driverId) {
      return res.status(403).json({
        success: false,
        message: 'You can only view your own routes'
      });
    }

    const routes = await routeService.getRoutesByDriver(driverId);
    res.status(200).json({
      success: true,
      count: routes.length,
      data: routes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching driver routes',
      error: error.message
    });
  }
};

// Get routes by truck
export const getRoutesByTruck = async (req, res) => {
  try {
    const routes = await routeService.getRoutesByTruck(req.params.truckId);
    res.status(200).json({
      success: true,
      count: routes.length,
      data: routes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching truck routes',
      error: error.message
    });
  }
};

// Get route statistics
export const getRouteStatistics = async (req, res) => {
  try {
    const statistics = await routeService.getRouteStatistics();
    res.status(200).json({
      success: true,
      data: statistics
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching route statistics',
      error: error.message
    });
  }
};

// Get my routes (for authenticated driver)
export const getMyRoutes = async (req, res) => {
  try {
    if (req.user.role !== 'Driver') {
      return res.status(403).json({
        success: false,
        message: 'This endpoint is only for drivers'
      });
    }

    const routes = await routeService.getRoutesByDriver(req.user.id);
    res.status(200).json({
      success: true,
      count: routes.length,
      data: routes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching your routes',
      error: error.message
    });
  }
};
