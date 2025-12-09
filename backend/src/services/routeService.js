import Route from '../models/Route.js';
import Truck from '../models/Truck.js';
import Driver from '../models/Driver.js';

class RouteService {
  async createRoute(routeData) {
    const existingRoute = await Route.findOne({ 
      routeNumber: routeData.routeNumber 
    });
    
    if (existingRoute) {
      throw new Error('Route with this number already exists');
    }

    const driver = await Driver.findById(routeData.driver);
    if (!driver) {
      throw new Error('Driver not found');
    }

    const truck = await Truck.findById(routeData.truck);
    if (!truck) {
      throw new Error('Truck not found');
    }

    if (truck.status !== 'Available') {
      throw new Error('Truck is not available');
    }

    const route = await Route.create(routeData);
    
    truck.status = 'InRoute';
    await truck.save();

    return await route.populate(['driver', 'truck']);
  }

  async getRouteById(routeId) {
    const route = await Route.findById(routeId)
      .populate('driver')
      .populate('truck')
      .populate('reports');
    
    if (!route) {
      throw new Error('Route not found');
    }
    return route;
  }

  async getAllRoutes(filters = {}) {
    const routes = await Route.find(filters)
      .populate('driver')
      .populate('truck');
    return routes;
  }

  async getRoutesByStatus(status) {
    const routes = await Route.find({ status })
      .populate('driver')
      .populate('truck');
    return routes;
  }

  async getRoutesByDriver(driverId) {
    const routes = await Route.find({ driver: driverId })
      .populate('truck');
    return routes;
  }

  async updateRoute(routeId, updateData) {
    const route = await Route.findByIdAndUpdate(
      routeId,
      updateData,
      { new: true, runValidators: true }
    ).populate(['driver', 'truck']);
    
    if (!route) {
      throw new Error('Route not found');
    }
    return route;
  }

  async deleteRoute(routeId) {
    const route = await Route.findById(routeId);
    if (!route) {
      throw new Error('Route not found');
    }

    if (route.status === 'InProgress') {
      throw new Error('Cannot delete a route in progress');
    }

    const truck = await Truck.findById(route.truck);
    if (truck && truck.status === 'InRoute') {
      truck.status = 'Available';
      await truck.save();
    }

    await Route.findByIdAndDelete(routeId);
    return route;
  }

  async assignTruck(routeId, truckId) {
    const route = await Route.findById(routeId);
    if (!route) {
      throw new Error('Route not found');
    }

    await route.assignTruck(truckId);
    return await route.populate(['driver', 'truck']);
  }

  async updateStatus(routeId, status) {
    const validStatuses = ['Planned', 'InProgress', 'Completed', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      throw new Error('Invalid status');
    }

    const route = await Route.findById(routeId);
    if (!route) {
      throw new Error('Route not found');
    }

    route.status = status;

    if (status === 'Completed' || status === 'Cancelled') {
      const truck = await Truck.findById(route.truck);
      if (truck) {
        truck.status = 'Available';
        await truck.save();
      }
    }

    await route.save();
    return await route.populate(['driver', 'truck']);
  }
}

export default new RouteService();
