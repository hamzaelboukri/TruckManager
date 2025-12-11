import Route from '../models/Route.js';
import truckService from './truckService.js';
import trailerService from './trailerService.js';
import tireService from './tireService.js';

class RouteService {
  async createRoute(routeData) {
    const existingRoute = await Route.findOne({
      routeNumber: routeData.routeNumber
    });

    if (existingRoute) {
      throw new Error('Route with this number already exists');
    }

    const route = await Route.create(routeData);
    return await route.populate('driver truck');
  }

  async getRouteById(routeId) {
    const route = await Route.findById(routeId)
      .populate('driver truck');

    if (!route) {
      throw new Error('Route not found');
    }
    return route;
  }

  async getAllRoutes(filters = {}, options = {}) {
    const { page = 1, limit = 10, sort = '-createdAt' } = options;
    const skip = (page - 1) * limit;

    const routes = await Route.find(filters)
      .populate('driver truck')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Route.countDocuments(filters);

    return {
      routes,
      total,
      page,
      pages: Math.ceil(total / limit)
    };
  }

  async getRoutesByStatus(status) {
    const routes = await Route.find({ status })
      .populate('driver truck');
    return routes;
  }

  async updateRoute(routeId, updateData) {
    const route = await Route.findByIdAndUpdate(
      routeId,
      updateData,
      { new: true, runValidators: true }
    ).populate('driver truck');

    if (!route) {
      throw new Error('Route not found');
    }
    return route;
  }

  async deleteRoute(routeId) {
    const route = await Route.findByIdAndDelete(routeId);
    if (!route) {
      throw new Error('Route not found');
    }
    return route;
  }

  async startRoute(routeId, departureKilometers) {
    const route = await Route.findById(routeId).populate('truck');

    if (!route) {
      throw new Error('Route not found');
    }

    if (route.status !== 'Planned') {
      throw new Error('Route must be in Planned status to start');
    }

    await route.startRoute(departureKilometers);
    return route;
  }

  async completeRoute(routeId, payload) {
    const { arrivalKilometers, fuelVolume, fuelCost, vehicleRemarks } = payload;
    
    const route = await Route.findById(routeId).populate('truck');

    if (!route) {
      throw new Error('Route not found');
    }

    if (route.status !== 'InProgress') {
      throw new Error('Route must be in progress to complete');
    }

    if (!route.departureKilometers) {
      throw new Error('Departure kilometers not set. Start the route first');
    }

    if (!arrivalKilometers || arrivalKilometers <= route.departureKilometers) {
      throw new Error('Arrival kilometers must be greater than departure kilometers');
    }

    const actualDistance = arrivalKilometers - route.departureKilometers;

    route.arrivalKilometers = arrivalKilometers;
    route.fuelVolume = fuelVolume || 0;
    route.fuelCost = fuelCost || 0;
    route.vehicleRemarks = vehicleRemarks || '';
    route.status = 'Completed';

    await route.save();

    const truck = await truckService.getTruckById(route.truck);
    const newTruckKm = truck.currentKilometers + actualDistance;
    await truckService.updateTruck(route.truck, { 
      currentKilometers: newTruckKm,
      status: 'Available'
    });

    await this.updateVehicleTires(route.truck, 'Truck', actualDistance);

    if (truck.trailer) {
      const trailer = await trailerService.getTrailerById(truck.trailer);
      const newTrailerKm = trailer.currentKilometers + actualDistance;
      await trailerService.updateTrailer(truck.trailer, {
        currentKilometers: newTrailerKm
      });

      await this.updateVehicleTires(truck.trailer, 'Trailer', actualDistance);
    }

    return route;
  }

  async updateVehicleTires(vehicleId, ownerType, distance) {
    const tires = await tireService.getTiresByVehicle(vehicleId, ownerType);

    for (const tire of tires) {
      const newKilometers = tire.currentKilometers + distance;
      await tireService.updateWear(tire._id, newKilometers);
    }
  }

  async getRoutesByDriver(driverId) {
    const routes = await Route.find({ driver: driverId })
      .populate('truck')
      .sort('-createdAt');
    return routes;
  }

  async getRoutesByTruck(truckId) {
    const routes = await Route.find({ truck: truckId })
      .populate('driver')
      .sort('-createdAt');
    return routes;
  }

  async getRouteStatistics() {
    const total = await Route.countDocuments();
    
    const byStatus = await Route.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalDistance = await Route.aggregate([
      {
        $match: { status: 'Completed' }
      },
      {
        $group: {
          _id: null,
          totalDistance: { $sum: '$distance' },
          totalFuel: { $sum: '$fuelVolume' },
          totalCost: { $sum: '$fuelCost' }
        }
      }
    ]);

    const avgFuelConsumption = await Route.aggregate([
      {
        $match: { 
          status: 'Completed',
          fuelVolume: { $gt: 0 },
          arrivalKilometers: { $exists: true },
          departureKilometers: { $exists: true }
        }
      },
      {
        $addFields: {
          actualDistance: { $subtract: ['$arrivalKilometers', '$departureKilometers'] },
          consumptionRate: {
            $multiply: [
              { $divide: ['$fuelVolume', { $subtract: ['$arrivalKilometers', '$departureKilometers'] }] },
              100
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          avgConsumption: { $avg: '$consumptionRate' }
        }
      }
    ]);

    return {
      total,
      byStatus: byStatus.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      totalDistance: totalDistance[0]?.totalDistance || 0,
      totalFuel: totalDistance[0]?.totalFuel || 0,
      totalFuelCost: totalDistance[0]?.totalCost || 0,
      avgFuelConsumption: avgFuelConsumption[0]?.avgConsumption || 0
    };
  }
}

export default new RouteService();