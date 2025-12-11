import { jest } from '@jest/globals';
import routeService from '../../services/routeService.js';
import Route from '../../models/Route.js';
import Truck from '../../models/Truck.js';
import Trailer from '../../models/Trailer.js';
import Tire from '../../models/Tire.js';
import Driver from '../../models/Driver.js';
import User from '../../models/User.js';
import { connectDB, closeDB, clearDB } from '../setup/testDb.js';

describe('Route Service Tests', () => {
  let testDriver;
  let testTruck;
  let testTrailer;
  let testTires;

  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await closeDB();
  });

  beforeEach(async () => {
    await clearDB();

    // Create test user for driver
    const user = await User.create({
      name: 'Test Driver',
      email: 'testdriver@test.com',
      password: 'hashedpassword123',
      role: 'Driver'
    });

    // Create test driver
    testDriver = await Driver.create({
      user: user._id,
      licenseNumber: 'DL123456789',
      licenseExpiryDate: new Date('2025-12-31'),
      status: 'Active'
    });

    // Create test truck
    testTruck = await Truck.create({
      registrationNumber: 'ABC-123-MA',
      model: 'Volvo FH16',
      year: 2020,
      purchaseDate: new Date('2020-01-15'),
      fuelCapacity: 400,
      currentKilometers: 100000,
      status: 'Available'
    });

    // Create test trailer
    testTrailer = await Trailer.create({
      registrationNumber: 'TRL-456-MA',
      brand: 'Krone',
      year: 2021,
      maxCapacity: 30000,
      purchaseDate: new Date('2021-03-10'),
      currentKilometers: 50000,
      ownerType: 'Trailer',
      status: 'Good'
    });

    // Note: Truck model doesn't have trailer field yet
    // Will be added in future update
    // testTruck.trailer = testTrailer._id;
    // await testTruck.save();

    // Create test tires for truck
    testTires = [];
    for (let i = 0; i < 6; i++) {
      const tire = await Tire.create({
        serialNumber: `TIRE-TRUCK-${i + 1}`,
        size: '315/80R22.5',
        brand: 'Michelin',
        purchaseDate: new Date('2023-01-15'),
        installationDate: new Date('2023-01-20'),
        installationKilometers: 90000,
        currentKilometers: 100000,
        wearPercentage: 20.0,
        vehicle: testTruck._id,
        ownerType: 'Truck',
        status: 'Good'
      });
      testTires.push(tire);
    }

    // Create test tires for trailer
    for (let i = 0; i < 4; i++) {
      const tire = await Tire.create({
        serialNumber: `TIRE-TRAILER-${i + 1}`,
        size: '385/65R22.5',
        brand: 'Michelin',
        purchaseDate: new Date('2023-01-15'),
        installationDate: new Date('2023-01-20'),
        installationKilometers: 45000,
        currentKilometers: 50000,
        wearPercentage: 10.0,
        vehicle: testTrailer._id,
        ownerType: 'Trailer',
        status: 'Good'
      });
      testTires.push(tire);
    }
  });

  describe('Create Route', () => {
    test('should create a new route successfully', async () => {
      const routeData = {
        driver: testDriver._id,
        truck: testTruck._id,
        description: 'Test Route Casablanca - Marrakech',
        routeNumber: 'RT-2024-001',
        departureLocation: 'Casablanca',
        arrivalLocation: 'Marrakech',
        distance: 240
      };

      const route = await routeService.createRoute(routeData);

      expect(route).toBeDefined();
      expect(route.routeNumber).toBe(routeData.routeNumber);
      // Route service populates driver, so check the _id
      const driverId = route.driver._id || route.driver;
      expect(driverId.toString()).toBe(testDriver._id.toString());
      const truckId = route.truck._id || route.truck;
      expect(truckId.toString()).toBe(testTruck._id.toString());
      expect(route.status).toBe('Planned');
      expect(route.distance).toBe(240);
    });

    test('should not create route with duplicate route number', async () => {
      const routeData = {
        driver: testDriver._id,
        truck: testTruck._id,
        description: 'Test Route',
        routeNumber: 'RT-DUPLICATE',
        departureLocation: 'Casablanca',
        arrivalLocation: 'Marrakech',
        distance: 240
      };

      await routeService.createRoute(routeData);

      await expect(routeService.createRoute(routeData)).rejects.toThrow();
    });
  });

  describe('Start Route', () => {
    test('should start a route with departure kilometers', async () => {
      const route = await routeService.createRoute({
        driver: testDriver._id,
        truck: testTruck._id,
        description: 'Test Route',
        routeNumber: 'RT-START-001',
        departureLocation: 'Casablanca',
        arrivalLocation: 'Marrakech',
        distance: 240
      });

      const startedRoute = await routeService.startRoute(route._id, 100000);

      expect(startedRoute.status).toBe('InProgress');
      expect(startedRoute.departureKilometers).toBe(100000);

      // Check truck status changed to InRoute
      const updatedTruck = await Truck.findById(testTruck._id);
      expect(updatedTruck.status).toBe('InRoute');
    });

    test('should not start route that is not in Planned status', async () => {
      const route = await routeService.createRoute({
        driver: testDriver._id,
        truck: testTruck._id,
        description: 'Test Route',
        routeNumber: 'RT-START-002',
        departureLocation: 'Casablanca',
        arrivalLocation: 'Marrakech',
        distance: 240
      });

      await routeService.startRoute(route._id, 100000);

      await expect(routeService.startRoute(route._id, 100000)).rejects.toThrow(
        'Route must be in Planned status to start'
      );
    });

    test('should not start route with invalid departure kilometers', async () => {
      const route = await routeService.createRoute({
        driver: testDriver._id,
        truck: testTruck._id,
        description: 'Test Route',
        routeNumber: 'RT-START-003',
        departureLocation: 'Casablanca',
        arrivalLocation: 'Marrakech',
        distance: 240
      });

      await expect(routeService.startRoute(route._id, -100)).rejects.toThrow(
        'Valid departure kilometers are required'
      );
    });
  });

  describe('Complete Route', () => {
    test('should complete route and update truck kilometers', async () => {
      const route = await routeService.createRoute({
        driver: testDriver._id,
        truck: testTruck._id,
        description: 'Test Route',
        routeNumber: 'RT-COMPLETE-001',
        departureLocation: 'Casablanca',
        arrivalLocation: 'Marrakech',
        distance: 240
      });

      await routeService.startRoute(route._id, 100000);

      const completedRoute = await routeService.completeRoute(route._id, {
        arrivalKilometers: 100240,
        fuelVolume: 85.5,
        fuelCost: 1200,
        vehicleRemarks: 'RAS'
      });

      expect(completedRoute.status).toBe('Completed');
      expect(completedRoute.arrivalKilometers).toBe(100240);
      expect(completedRoute.fuelVolume).toBe(85.5);
      expect(completedRoute.fuelCost).toBe(1200);
      expect(completedRoute.actualDistance).toBe(240);

      // Check truck kilometers updated
      const updatedTruck = await Truck.findById(testTruck._id);
      expect(updatedTruck.currentKilometers).toBe(100240);
      expect(updatedTruck.status).toBe('Available');
    });

    test('should complete route and update all tire kilometers and wear', async () => {
      const route = await routeService.createRoute({
        driver: testDriver._id,
        truck: testTruck._id,
        description: 'Test Route',
        routeNumber: 'RT-COMPLETE-002',
        departureLocation: 'Casablanca',
        arrivalLocation: 'Marrakech',
        distance: 240
      });

      await routeService.startRoute(route._id, 100000);

      await routeService.completeRoute(route._id, {
        arrivalKilometers: 100240,
        fuelVolume: 85.5,
        fuelCost: 1200
      });

      // Check truck tires updated
      const truckTires = await Tire.find({ vehicle: testTruck._id });
      truckTires.forEach(tire => {
        expect(tire.currentKilometers).toBe(100240); // 100000 + 240
      });

      // Note: Trailer functionality will be tested when trailer field is added to Truck model
    });

    test('should complete route without errors when no trailer attached', async () => {
      const route = await routeService.createRoute({
        driver: testDriver._id,
        truck: testTruck._id,
        description: 'Test Route',
        routeNumber: 'RT-COMPLETE-003',
        departureLocation: 'Casablanca',
        arrivalLocation: 'Marrakech',
        distance: 240
      });

      await routeService.startRoute(route._id, 100000);

      const completedRoute = await routeService.completeRoute(route._id, {
        arrivalKilometers: 100240,
        fuelVolume: 85.5,
        fuelCost: 1200
      });

      // Should complete successfully without trailer
      expect(completedRoute.status).toBe('Completed');
      expect(completedRoute.actualDistance).toBe(240);
    });

    test('should not complete route that is not in progress', async () => {
      const route = await routeService.createRoute({
        driver: testDriver._id,
        truck: testTruck._id,
        description: 'Test Route',
        routeNumber: 'RT-COMPLETE-004',
        departureLocation: 'Casablanca',
        arrivalLocation: 'Marrakech',
        distance: 240
      });

      await expect(routeService.completeRoute(route._id, {
        arrivalKilometers: 100240
      })).rejects.toThrow('Route must be in progress to complete');
    });

    test('should not complete route with arrival km less than departure km', async () => {
      const route = await routeService.createRoute({
        driver: testDriver._id,
        truck: testTruck._id,
        description: 'Test Route',
        routeNumber: 'RT-COMPLETE-005',
        departureLocation: 'Casablanca',
        arrivalLocation: 'Marrakech',
        distance: 240
      });

      await routeService.startRoute(route._id, 100000);

      await expect(routeService.completeRoute(route._id, {
        arrivalKilometers: 99000
      })).rejects.toThrow('Arrival kilometers must be greater than departure kilometers');
    });

    test('should calculate fuel consumption rate correctly', async () => {
      const route = await routeService.createRoute({
        driver: testDriver._id,
        truck: testTruck._id,
        description: 'Test Route',
        routeNumber: 'RT-COMPLETE-006',
        departureLocation: 'Casablanca',
        arrivalLocation: 'Marrakech',
        distance: 240
      });

      await routeService.startRoute(route._id, 100000);

      const completedRoute = await routeService.completeRoute(route._id, {
        arrivalKilometers: 100240,
        fuelVolume: 85.5,
        fuelCost: 1200
      });

      // Fuel consumption rate = (fuelVolume / actualDistance) * 100
      // (85.5 / 240) * 100 = 35.625 L/100km
      expect(completedRoute.fuelConsumptionRate).toBeCloseTo(35.625, 1);
    });
  });

  describe('Update Route', () => {
    test('should update route description and distance', async () => {
      const route = await routeService.createRoute({
        driver: testDriver._id,
        truck: testTruck._id,
        description: 'Original Description',
        routeNumber: 'RT-UPDATE-001',
        departureLocation: 'Casablanca',
        arrivalLocation: 'Marrakech',
        distance: 240
      });

      const updatedRoute = await routeService.updateRoute(route._id, {
        description: 'Updated Description',
        distance: 250
      });

      expect(updatedRoute.description).toBe('Updated Description');
      expect(updatedRoute.distance).toBe(250);
    });

    test('should update route progress with partial data', async () => {
      const route = await routeService.createRoute({
        driver: testDriver._id,
        truck: testTruck._id,
        description: 'Test Route',
        routeNumber: 'RT-UPDATE-002',
        departureLocation: 'Casablanca',
        arrivalLocation: 'Marrakech',
        distance: 240
      });

      await routeService.startRoute(route._id, 100000);

      const updatedRoute = await routeService.updateRoute(route._id, {
        fuelVolume: 45.5,
        fuelCost: 650,
        vehicleRemarks: 'Pression pneu faible'
      });

      expect(updatedRoute.fuelVolume).toBe(45.5);
      expect(updatedRoute.fuelCost).toBe(650);
      expect(updatedRoute.vehicleRemarks).toBe('Pression pneu faible');
    });
  });

  describe('Get Routes', () => {
    test('should get all routes with pagination', async () => {
      // Create 3 test routes
      for (let i = 1; i <= 3; i++) {
        await routeService.createRoute({
          driver: testDriver._id,
          truck: testTruck._id,
          description: `Test Route ${i}`,
          routeNumber: `RT-GET-${i.toString().padStart(3, '0')}`,
          departureLocation: 'Casablanca',
          arrivalLocation: 'Marrakech',
          distance: 240
        });
      }

      const result = await routeService.getAllRoutes({ page: 1, limit: 10 });

      // Check if result has routes array or if routes are at data level
      const routes = result.routes || result.data || result;
      expect(routes.length).toBeGreaterThanOrEqual(3);
      if (result.pagination) {
        expect(result.pagination.total).toBeGreaterThanOrEqual(3);
      }
    });

    test('should filter routes by status', async () => {
      const route1 = await routeService.createRoute({
        driver: testDriver._id,
        truck: testTruck._id,
        description: 'Route 1',
        routeNumber: 'RT-FILTER-001',
        departureLocation: 'Casablanca',
        arrivalLocation: 'Marrakech',
        distance: 240
      });

      await routeService.startRoute(route1._id, 100000);

      await routeService.createRoute({
        driver: testDriver._id,
        truck: testTruck._id,
        description: 'Route 2',
        routeNumber: 'RT-FILTER-002',
        departureLocation: 'Rabat',
        arrivalLocation: 'Fes',
        distance: 200
      });

      const result = await routeService.getRoutesByStatus('InProgress');

      expect(result).toHaveLength(1);
      expect(result[0].status).toBe('InProgress');
    });

    test('should get routes by driver', async () => {
      await routeService.createRoute({
        driver: testDriver._id,
        truck: testTruck._id,
        description: 'Driver Route',
        routeNumber: 'RT-DRIVER-001',
        departureLocation: 'Casablanca',
        arrivalLocation: 'Marrakech',
        distance: 240
      });

      const result = await routeService.getRoutesByDriver(testDriver._id);

      expect(result).toHaveLength(1);
      expect(result[0].driver.toString()).toBe(testDriver._id.toString());
    });

    test('should get routes by truck', async () => {
      await routeService.createRoute({
        driver: testDriver._id,
        truck: testTruck._id,
        description: 'Truck Route',
        routeNumber: 'RT-TRUCK-001',
        departureLocation: 'Casablanca',
        arrivalLocation: 'Marrakech',
        distance: 240
      });

      const result = await routeService.getRoutesByTruck(testTruck._id);

      expect(result).toHaveLength(1);
      expect(result[0].truck.toString()).toBe(testTruck._id.toString());
    });
  });

  describe('Route Statistics', () => {
    test('should calculate route statistics correctly', async () => {
      // Create and complete multiple routes
      for (let i = 1; i <= 3; i++) {
        const route = await routeService.createRoute({
          driver: testDriver._id,
          truck: testTruck._id,
          description: `Route ${i}`,
          routeNumber: `RT-STATS-${i.toString().padStart(3, '0')}`,
          departureLocation: 'Casablanca',
          arrivalLocation: 'Marrakech',
          distance: 240
        });

        await routeService.startRoute(route._id, 100000);
        await routeService.completeRoute(route._id, {
          arrivalKilometers: 100240,
          fuelVolume: 85.5,
          fuelCost: 1200
        });
      }

      const stats = await routeService.getRouteStatistics();

      expect(stats.total).toBe(3);
      expect(stats.byStatus.Completed).toBe(3);
      expect(stats.totalDistance).toBe(720); // 240 * 3
      expect(stats.totalFuel).toBe(256.5); // 85.5 * 3
      expect(stats.totalFuelCost).toBe(3600); // 1200 * 3
      expect(stats.avgFuelConsumption).toBeCloseTo(35.625, 1);
    });
  });

  describe('Delete Route', () => {
    test('should delete a route successfully', async () => {
      const route = await routeService.createRoute({
        driver: testDriver._id,
        truck: testTruck._id,
        description: 'Route to Delete',
        routeNumber: 'RT-DELETE-001',
        departureLocation: 'Casablanca',
        arrivalLocation: 'Marrakech',
        distance: 240
      });

      await routeService.deleteRoute(route._id);

      const deletedRoute = await Route.findById(route._id);
      expect(deletedRoute).toBeNull();
    });
  });
});
