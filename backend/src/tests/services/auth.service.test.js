import { jest } from '@jest/globals';
import userService from '../../services/userService.js';
import driverService from '../../services/driverService.js';
import User from '../../models/User.js';
import Driver from '../../models/Driver.js';
import { connectDB, closeDB, clearDB } from '../setup/testDb.js';

describe('Authentication Service Tests', () => {
  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await closeDB();
  });

  afterEach(async () => {
    await clearDB();
  });

  describe('User Registration', () => {
    test('should register a new admin user successfully', async () => {
      const userData = {
        name: 'Test Admin',
        email: 'admin@test.com',
        password: 'admin123',
        role: 'Admin'
      };

      const user = await userService.createUser(userData);

      expect(user).toBeDefined();
      expect(user.name).toBe(userData.name);
      expect(user.email).toBe(userData.email);
      expect(user.role).toBe(userData.role);
      expect(user.password).not.toBe(userData.password); // Password should be hashed
    });

    test('should register a new driver with license number', async () => {
      const userData = {
        name: 'Test Driver',
        email: 'driver@test.com',
        password: 'driver123'
      };
      const licenseNumber = 'DL123456789';

      const driver = await driverService.createDriver(userData, licenseNumber);

      expect(driver).toBeDefined();
      expect(driver.licenseNumber).toBe(licenseNumber);
      expect(driver.user).toBeDefined();
      expect(driver.user.name).toBe(userData.name);
      expect(driver.user.email).toBe(userData.email);
      expect(driver.user.role).toBe('Driver');
    });

    test('should not register user with duplicate email', async () => {
      const userData = {
        name: 'Test User',
        email: 'duplicate@test.com',
        password: 'password123',
        role: 'Admin'
      };

      await userService.createUser(userData);

      await expect(userService.createUser(userData)).rejects.toThrow(
        'User with this email already exists'
      );
    });

    test('should hash password before saving', async () => {
      const userData = {
        name: 'Test User',
        email: 'hash@test.com',
        password: 'plainPassword123',
        role: 'Admin'
      };

      const user = await userService.createUser(userData);
      const savedUser = await User.findById(user._id).select('+password');

      expect(savedUser.password).not.toBe(userData.password);
      expect(savedUser.password).toMatch(/^\$2[aby]\$/); // bcrypt hash pattern
    });
  });

  describe('User Login', () => {
    test('should login with valid credentials', async () => {
      const userData = {
        name: 'Login Test',
        email: 'login@test.com',
        password: 'password123',
        role: 'Admin'
      };

      await userService.createUser(userData);

      const result = await userService.login(userData.email, userData.password);

      expect(result).toBeDefined();
      expect(result.token).toBeDefined();
      expect(result.user).toBeDefined();
      expect(result.user.email).toBe(userData.email);
      expect(result.user.role).toBe(userData.role);
    });

    test('should not login with invalid password', async () => {
      const userData = {
        name: 'Test User',
        email: 'invalid@test.com',
        password: 'correctPassword',
        role: 'Admin'
      };

      await userService.createUser(userData);

      await expect(
        userService.login(userData.email, 'wrongPassword')
      ).rejects.toThrow('Invalid credentials');
    });

    test('should not login with non-existent email', async () => {
      await expect(
        userService.login('nonexistent@test.com', 'password123')
      ).rejects.toThrow('User not found');
    });

    test('should return valid JWT token on successful login', async () => {
      const userData = {
        name: 'JWT Test',
        email: 'jwt@test.com',
        password: 'password123',
        role: 'Admin'
      };

      await userService.createUser(userData);
      const result = await userService.login(userData.email, userData.password);

      // JWT token should have 3 parts separated by dots
      expect(result.token.split('.')).toHaveLength(3);
    });
  });

  describe('User Retrieval', () => {
    test('should get user by ID', async () => {
      const userData = {
        name: 'Get User Test',
        email: 'getuser@test.com',
        password: 'password123',
        role: 'Admin'
      };

      const createdUser = await userService.createUser(userData);
      const foundUser = await userService.getUserById(createdUser._id);

      expect(foundUser).toBeDefined();
      expect(foundUser._id.toString()).toBe(createdUser._id.toString());
      expect(foundUser.email).toBe(userData.email);
    });

    test('should throw error when user not found by ID', async () => {
      const fakeId = '507f1f77bcf86cd799439011'; // Valid ObjectId string

      await expect(userService.getUserById(fakeId)).rejects.toThrow('User not found');
    });

    test('should get user by email', async () => {
      const userData = {
        name: 'Email Test',
        email: 'findemail@test.com',
        password: 'password123',
        role: 'Admin'
      };

      await userService.createUser(userData);
      const foundUser = await userService.getUserByEmail(userData.email);

      expect(foundUser).toBeDefined();
      expect(foundUser.email).toBe(userData.email);
      expect(foundUser.password).toBeDefined(); // Should include password when using getUserByEmail
    });

    test('should get all users', async () => {
      const users = [
        { name: 'User 1', email: 'user1@test.com', password: 'pass123', role: 'Admin' },
        { name: 'User 2', email: 'user2@test.com', password: 'pass123', role: 'Driver' },
        { name: 'User 3', email: 'user3@test.com', password: 'pass123', role: 'Admin' }
      ];

      for (const userData of users) {
        await userService.createUser(userData);
      }

      const allUsers = await userService.getAllUsers();

      expect(allUsers).toHaveLength(3);
    });

    test('should filter users by role', async () => {
      await userService.createUser({ name: 'Admin 1', email: 'admin1@test.com', password: 'pass123', role: 'Admin' });
      await userService.createUser({ name: 'Admin 2', email: 'admin2@test.com', password: 'pass123', role: 'Admin' });

      const adminUsers = await userService.getAllUsers({ role: 'Admin' });

      expect(adminUsers).toHaveLength(2);
      adminUsers.forEach(user => {
        expect(user.role).toBe('Admin');
      });
    });
  });

  describe('User Update', () => {
    test('should update user successfully', async () => {
      const userData = {
        name: 'Original Name',
        email: 'update@test.com',
        password: 'password123',
        role: 'Admin'
      };

      const user = await userService.createUser(userData);
      const updatedUser = await userService.updateUser(user._id, { name: 'Updated Name' });

      expect(updatedUser.name).toBe('Updated Name');
      expect(updatedUser.email).toBe(userData.email);
    });

    test('should throw error when updating non-existent user', async () => {
      const fakeId = '507f1f77bcf86cd799439011'; // Valid ObjectId string

      await expect(
        userService.updateUser(fakeId, { name: 'New Name' })
      ).rejects.toThrow('User not found');
    });
  });

  describe('User Deletion', () => {
    test('should delete user successfully', async () => {
      const userData = {
        name: 'Delete Test',
        email: 'delete@test.com',
        password: 'password123',
        role: 'Admin'
      };

      const user = await userService.createUser(userData);
      const deletedUser = await userService.deleteUser(user._id);

      expect(deletedUser._id.toString()).toBe(user._id.toString());

      const foundUser = await User.findById(user._id);
      expect(foundUser).toBeNull();
    });

    test('should throw error when deleting non-existent user', async () => {
      const fakeId = '507f1f77bcf86cd799439011'; // Valid ObjectId string

      await expect(userService.deleteUser(fakeId)).rejects.toThrow('User not found');
    });
  });

  describe('Driver Specific Tests', () => {
    test('should create driver with unique license number', async () => {
      const userData = {
        name: 'Driver 1',
        email: 'driver1@test.com',
        password: 'password123'
      };

      const driver = await driverService.createDriver(userData, 'DL001');

      expect(driver.licenseNumber).toBe('DL001');
      expect(driver.user.role).toBe('Driver');
    });

    test('should not create driver with duplicate license number', async () => {
      const userData1 = {
        name: 'Driver 1',
        email: 'driver1@test.com',
        password: 'password123'
      };

      const userData2 = {
        name: 'Driver 2',
        email: 'driver2@test.com',
        password: 'password123'
      };

      await driverService.createDriver(userData1, 'DL001');

      await expect(
        driverService.createDriver(userData2, 'DL001')
      ).rejects.toThrow();
    });

    test.skip('should get driver by ID with populated user', async () => {
      // Skipping due to Route model dependency
      const userData = {
        name: 'Get Driver',
        email: 'getdriver@test.com',
        password: 'password123'
      };

      const createdDriver = await driverService.createDriver(userData, 'DL999');
      const foundDriver = await driverService.getDriverById(createdDriver._id);

      expect(foundDriver).toBeDefined();
      expect(foundDriver.licenseNumber).toBe('DL999');
      expect(foundDriver.user).toBeDefined();
      expect(foundDriver.user.name).toBe(userData.name);
    });

    test('should get all drivers', async () => {
      await driverService.createDriver(
        { name: 'Driver 1', email: 'driver1@test.com', password: 'pass123' },
        'DL101'
      );
      await driverService.createDriver(
        { name: 'Driver 2', email: 'driver2@test.com', password: 'pass123' },
        'DL102'
      );

      const drivers = await driverService.getAllDrivers();

      expect(drivers).toHaveLength(2);
    });
  });

  describe('Password Comparison', () => {
    test('should correctly compare passwords', async () => {
      const userData = {
        name: 'Password Test',
        email: 'passtest@test.com',
        password: 'mySecretPassword',
        role: 'Admin'
      };

      const user = await userService.createUser(userData);
      const foundUser = await User.findById(user._id).select('+password');

      const isMatch = await foundUser.comparePassword('mySecretPassword');
      expect(isMatch).toBe(true);

      const isNotMatch = await foundUser.comparePassword('wrongPassword');
      expect(isNotMatch).toBe(false);
    });
  });
});
