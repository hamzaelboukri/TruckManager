# Authentication Tests

This directory contains comprehensive Jest tests for the authentication system.

## Test Structure

```
src/tests/
├── setup/
│   └── testDb.js              # MongoDB Memory Server setup
├── services/
│   └── auth.service.test.js   # Service layer tests (21 tests)
├── controllers/
│   └── auth.controller.unit.test.js  # Controller unit tests (13 tests)
└── middleware/
    └── role.middleware.test.js       # Role middleware tests (6 tests)
```

## Test Coverage

### Service Layer Tests (`auth.service.test.js`)
- ✅ User Registration (Admin & Driver with license numbers)
- ✅ User Login (valid/invalid credentials)
- ✅ User Retrieval (by ID, by email, all users, filtering)
- ✅ User Update & Deletion
- ✅ Driver Specific Operations
- ✅ Password Hashing & Comparison
- ✅ JWT Token Generation

**Total: 21 tests passing, 1 skipped**

### Controller Unit Tests (`auth.controller.unit.test.js`)
- ✅ Request validation structure
- ✅ Response format validation
- ✅ Required fields validation
- ✅ HTTP status codes

**Total: 13 tests passing**

### Middleware Tests (`role.middleware.test.js`)
- ✅ Admin role authorization
- ✅ Driver role authorization
- ✅ Access denial for unauthorized roles

**Total: 6 tests passing**

## Running Tests

### Run all tests
```bash
npm test
```

### Run tests in watch mode
```bash
npm run test:watch
```

### Run tests with coverage
```bash
npm run test:coverage
```

## Test Results Summary

- **Test Suites:** 3 passed, 3 total
- **Tests:** 40 passed, 1 skipped, 41 total
- **Status:** ✅ All critical tests passing

## Technologies

- **Jest** v30.2.0 - Testing framework
- **MongoDB Memory Server** v9.1.5 - In-memory MongoDB for testing
- **@jest/globals** v29.7.0 - Jest global functions

## Key Features Tested

1. **User Registration**
   - Admin user creation
   - Driver user creation with license number
   - Duplicate email validation
   - Password hashing

2. **User Authentication**
   - Login with valid credentials
   - Invalid password rejection
   - Non-existent user handling
   - JWT token generation and validation

3. **Authorization**
   - Role-based access control (Admin/Driver)
   - Protected route middleware
   - Access denial for unauthorized roles

4. **Data Management**
   - CRUD operations on users
   - Driver-specific operations
   - Data filtering and retrieval

## Notes

- All tests use MongoDB Memory Server for isolation
- Each test suite has proper setup/teardown
- Database is cleared between tests
- One test is skipped due to Route model dependency (to be implemented later)
