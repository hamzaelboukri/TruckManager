import { jest } from '@jest/globals';
import {
  getAllRoutes,
  getRouteById,
  createRoute,
  updateRoute,
  deleteRoute,
  startRoute,
  completeRoute,
  updateRouteProgress,
  getRoutesByStatus,
  getRoutesByDriver,
  getRoutesByTruck,
  getMyRoutes,
  getRouteStatistics
} from '../../controllers/routeController.js';
import routeService from '../../services/routeService.js';

// Simplified mocking approach for ES6 modules
const mockGetAllRoutes = jest.fn();
const mockGetRouteById = jest.fn();
const mockCreateRoute = jest.fn();
const mockUpdateRoute = jest.fn();
const mockDeleteRoute = jest.fn();
const mockStartRoute = jest.fn();
const mockCompleteRoute = jest.fn();
const mockGetRoutesByStatus = jest.fn();
const mockGetRoutesByDriver = jest.fn();
const mockGetRoutesByTruck = jest.fn();
const mockGetRouteStatistics = jest.fn();

// Replace service methods with mocks
routeService.getAllRoutes = mockGetAllRoutes;
routeService.getRouteById = mockGetRouteById;
routeService.createRoute = mockCreateRoute;
routeService.updateRoute = mockUpdateRoute;
routeService.deleteRoute = mockDeleteRoute;
routeService.startRoute = mockStartRoute;
routeService.completeRoute = mockCompleteRoute;
routeService.getRoutesByStatus = mockGetRoutesByStatus;
routeService.getRoutesByDriver = mockGetRoutesByDriver;
routeService.getRoutesByTruck = mockGetRoutesByTruck;
routeService.getRouteStatistics = mockGetRouteStatistics;

describe('Route Controller Tests', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
      query: {},
      user: { id: 'user123', role: 'Admin' }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    // Clear all mocks
    mockGetAllRoutes.mockClear();
    mockGetRouteById.mockClear();
    mockCreateRoute.mockClear();
    mockUpdateRoute.mockClear();
    mockDeleteRoute.mockClear();
    mockStartRoute.mockClear();
    mockCompleteRoute.mockClear();
    mockGetRoutesByStatus.mockClear();
    mockGetRoutesByDriver.mockClear();
    mockGetRoutesByTruck.mockClear();
    mockGetRouteStatistics.mockClear();
  });

  describe('getAllRoutes', () => {
    test('should return all routes with pagination', async () => {
      const mockResult = {
        routes: [
          { _id: 'route1', routeNumber: 'RT-001', status: 'Planned' },
          { _id: 'route2', routeNumber: 'RT-002', status: 'InProgress' }
        ],
        page: 1,
        total: 2,
        pages: 1
      };

      mockGetAllRoutes.mockResolvedValue(mockResult);

      req.query = { page: '1', limit: '10' };

      await getAllRoutes(req, res);

      expect(mockGetAllRoutes).toHaveBeenCalledWith(
        {},
        { page: 1, limit: 10, sort: '-createdAt' }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockResult.routes,
        pagination: {
          page: 1,
          limit: 10,
          total: 2,
          pages: 1
        }
      });
    });

    test('should filter routes by status', async () => {
      const mockResult = {
        routes: [{ _id: 'route1', status: 'InProgress' }],
        page: 1,
        total: 1,
        pages: 1
      };

      mockGetAllRoutes.mockResolvedValue(mockResult);

      req.query = { status: 'InProgress', page: '1', limit: '10' };

      await getAllRoutes(req, res);

      expect(mockGetAllRoutes).toHaveBeenCalledWith(
        { status: 'InProgress' },
        { page: 1, limit: 10, sort: '-createdAt' }
      );
      expect(res.status).toHaveBeenCalledWith(200);
    });

    test('should handle errors', async () => {
      mockGetAllRoutes.mockRejectedValue(new Error('Database error'));

      await getAllRoutes(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Error fetching routes',
        error: 'Database error'
      });
    });
  });

  describe('getRouteById', () => {
    test('should return route by id', async () => {
      const mockRoute = {
        _id: 'route123',
        routeNumber: 'RT-001',
        status: 'Planned'
      };

      mockGetRouteById.mockResolvedValue(mockRoute);

      req.params.id = 'route123';

      await getRouteById(req, res);

      expect(mockGetRouteById).toHaveBeenCalledWith('route123');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockRoute
      });
    });

    test('should handle route not found', async () => {
      mockGetRouteById.mockRejectedValue(new Error('Route not found'));

      req.params.id = 'invalid123';

      await getRouteById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Route not found'
      });
    });
  });

  describe('createRoute', () => {
    test('should create a new route', async () => {
      const mockRoute = {
        _id: 'route123',
        routeNumber: 'RT-001',
        driver: 'driver123',
        truck: 'truck123',
        status: 'Planned'
      };

      mockCreateRoute.mockResolvedValue(mockRoute);

      req.body = {
        routeNumber: 'RT-001',
        driver: 'driver123',
        truck: 'truck123',
        departureLocation: 'Casablanca',
        arrivalLocation: 'Marrakech',
        distance: 240
      };

      await createRoute(req, res);

      expect(mockCreateRoute).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Route created successfully',
        data: mockRoute
      });
    });

    test('should handle validation errors', async () => {
      mockCreateRoute.mockRejectedValue(new Error('Validation failed'));

      req.body = { routeNumber: 'RT-001' }; // Missing required fields

      await createRoute(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Error creating route',
        error: 'Validation failed'
      });
    });
  });

  describe('updateRoute', () => {
    test('should update route', async () => {
      const mockRoute = {
        _id: 'route123',
        description: 'Updated description'
      };

      mockUpdateRoute.mockResolvedValue(mockRoute);

      req.params.id = 'route123';
      req.body = { description: 'Updated description' };

      await updateRoute(req, res);

      expect(mockUpdateRoute).toHaveBeenCalledWith('route123', req.body);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Route updated successfully',
        data: mockRoute
      });
    });

    test('should handle update errors', async () => {
      mockUpdateRoute.mockRejectedValue(new Error('Update failed'));

      req.params.id = 'route123';
      req.body = { description: 'Test' };

      await updateRoute(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Error updating route',
        error: 'Update failed'
      });
    });
  });

  describe('deleteRoute', () => {
    test('should delete route', async () => {
      mockDeleteRoute.mockResolvedValue({ _id: 'route123' });

      req.params.id = 'route123';

      await deleteRoute(req, res);

      expect(mockDeleteRoute).toHaveBeenCalledWith('route123');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Route deleted successfully'
      });
    });

    test('should handle delete errors', async () => {
      mockDeleteRoute.mockRejectedValue(new Error('Route not found'));

      req.params.id = 'invalid123';

      await deleteRoute(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Route not found'
      });
    });
  });

  describe('startRoute', () => {
    test('should start route with departure kilometers', async () => {
      const mockRoute = {
        _id: 'route123',
        status: 'InProgress',
        departureKilometers: 100000
      };

      mockStartRoute.mockResolvedValue(mockRoute);

      req.params.id = 'route123';
      req.body = { departureKilometers: 100000 };

      await startRoute(req, res);

      expect(mockStartRoute).toHaveBeenCalledWith('route123', 100000);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Route started successfully',
        data: mockRoute
      });
    });

    test('should validate departure kilometers', async () => {
      req.params.id = 'route123';
      req.body = { departureKilometers: -100 };

      await startRoute(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Valid departure kilometers are required'
      });
    });

    test('should handle start errors', async () => {
      mockStartRoute.mockRejectedValue(new Error('Route must be in Planned status'));

      req.params.id = 'route123';
      req.body = { departureKilometers: 100000 };

      await startRoute(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Route must be in Planned status'
      });
    });
  });

  describe('completeRoute', () => {
    test('should complete route with all data', async () => {
      const mockRoute = {
        _id: 'route123',
        status: 'Completed',
        departureKilometers: 100000,
        arrivalKilometers: 100240,
        fuelVolume: 85.5,
        fuelCost: 1200,
        actualDistance: 240
      };

      mockCompleteRoute.mockResolvedValue(mockRoute);

      req.params.id = 'route123';
      req.body = {
        arrivalKilometers: 100240,
        fuelVolume: 85.5,
        fuelCost: 1200,
        vehicleRemarks: 'RAS'
      };

      await completeRoute(req, res);

      expect(mockCompleteRoute).toHaveBeenCalledWith('route123', req.body);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Route completed successfully. Truck, trailer, and tires updated.',
        data: mockRoute
      });
    });

    test('should validate arrival kilometers', async () => {
      req.params.id = 'route123';
      req.body = { arrivalKilometers: -100 };

      await completeRoute(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Valid arrival kilometers are required'
      });
    });

    test('should handle completion errors', async () => {
      mockCompleteRoute.mockRejectedValue(
        new Error('Arrival kilometers must be greater than departure kilometers')
      );

      req.params.id = 'route123';
      req.body = { arrivalKilometers: 100240 };

      await completeRoute(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Arrival kilometers must be greater than departure kilometers'
      });
    });
  });

  describe('updateRouteProgress', () => {
    test('should update route progress for driver', async () => {
      const mockRoute = {
        _id: 'route123',
        driver: { _id: 'user123' },
        fuelVolume: 45.5,
        fuelCost: 650
      };

      mockGetRouteById.mockResolvedValue(mockRoute);
      mockUpdateRoute.mockResolvedValue({
        ...mockRoute,
        fuelVolume: 45.5,
        fuelCost: 650
      });

      req.params.id = 'route123';
      req.body = { fuelVolume: 45.5, fuelCost: 650 };
      req.user = { id: 'user123', role: 'Driver' };

      await updateRouteProgress(req, res);

      expect(mockGetRouteById).toHaveBeenCalledWith('route123');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Route progress updated successfully',
        data: expect.any(Object)
      });
    });

    test('should reject unauthorized driver', async () => {
      const mockRoute = {
        _id: 'route123',
        driver: { _id: 'otherDriver' }
      };

      mockGetRouteById.mockResolvedValue(mockRoute);

      req.params.id = 'route123';
      req.body = { fuelVolume: 45.5 };
      req.user = { id: 'user123', role: 'Driver' };

      await updateRouteProgress(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'You can only update your own routes'
      });
    });

    test('should allow admin to update any route', async () => {
      const mockRoute = {
        _id: 'route123',
        driver: { _id: 'otherDriver' }
      };

      mockGetRouteById.mockResolvedValue(mockRoute);
      mockUpdateRoute.mockResolvedValue(mockRoute);

      req.params.id = 'route123';
      req.body = { fuelVolume: 45.5 };
      req.user = { id: 'admin123', role: 'Admin' };

      await updateRouteProgress(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('getRoutesByStatus', () => {
    test('should return routes by status', async () => {
      const mockRoutes = [
        { _id: 'route1', status: 'InProgress' },
        { _id: 'route2', status: 'InProgress' }
      ];

      mockGetRoutesByStatus.mockResolvedValue(mockRoutes);

      req.params.status = 'InProgress';

      await getRoutesByStatus(req, res);

      expect(mockGetRoutesByStatus).toHaveBeenCalledWith('InProgress');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        count: 2,
        data: mockRoutes
      });
    });

    test('should handle invalid status', async () => {
      mockGetRoutesByStatus.mockRejectedValue(new Error('Invalid status'));

      req.params.status = 'InvalidStatus';

      await getRoutesByStatus(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Error fetching routes by status',
        error: 'Invalid status'
      });
    });
  });

  describe('getRoutesByDriver', () => {
    test('should return routes for driver', async () => {
      const mockRoutes = [
        { _id: 'route1', driver: 'driver123' }
      ];

      mockGetRoutesByDriver.mockResolvedValue(mockRoutes);

      req.params.driverId = 'driver123';
      req.user = { id: 'driver123', role: 'Driver' };

      await getRoutesByDriver(req, res);

      expect(mockGetRoutesByDriver).toHaveBeenCalledWith('driver123');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        count: 1,
        data: mockRoutes
      });
    });

    test('should prevent driver from viewing other driver routes', async () => {
      req.params.driverId = 'otherDriver';
      req.user = { id: 'driver123', role: 'Driver' };

      await getRoutesByDriver(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'You can only view your own routes'
      });
    });

    test('should allow admin to view any driver routes', async () => {
      const mockRoutes = [{ _id: 'route1' }];

      mockGetRoutesByDriver.mockResolvedValue(mockRoutes);

      req.params.driverId = 'anyDriver';
      req.user = { id: 'admin123', role: 'Admin' };

      await getRoutesByDriver(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('getRoutesByTruck', () => {
    test('should return routes by truck', async () => {
      const mockRoutes = [
        { _id: 'route1', truck: 'truck123' }
      ];

      mockGetRoutesByTruck.mockResolvedValue(mockRoutes);

      req.params.truckId = 'truck123';

      await getRoutesByTruck(req, res);

      expect(mockGetRoutesByTruck).toHaveBeenCalledWith('truck123');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        count: 1,
        data: mockRoutes
      });
    });
  });

  describe('getMyRoutes', () => {
    test('should return authenticated driver routes', async () => {
      const mockRoutes = [
        { _id: 'route1', driver: 'driver123' }
      ];

      mockGetRoutesByDriver.mockResolvedValue(mockRoutes);

      req.user = { id: 'driver123', role: 'Driver' };

      await getMyRoutes(req, res);

      expect(mockGetRoutesByDriver).toHaveBeenCalledWith('driver123');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        count: 1,
        data: mockRoutes
      });
    });
  });

  describe('getRouteStatistics', () => {
    test('should return route statistics', async () => {
      const mockStats = {
        total: 156,
        byStatus: {
          Planned: 12,
          InProgress: 5,
          Completed: 134,
          Cancelled: 5
        },
        totalDistance: 45680,
        totalFuel: 15234.5,
        totalFuelCost: 213425,
        avgFuelConsumption: 33.37
      };

      mockGetRouteStatistics.mockResolvedValue(mockStats);

      await getRouteStatistics(req, res);

      expect(mockGetRouteStatistics).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockStats
      });
    });

    test('should handle statistics errors', async () => {
      mockGetRouteStatistics.mockRejectedValue(new Error('Stats calculation failed'));

      await getRouteStatistics(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Error fetching route statistics',
        error: 'Stats calculation failed'
      });
    });
  });
});
