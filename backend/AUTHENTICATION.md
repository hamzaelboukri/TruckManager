# TruckManager Authentication API

## Authentication Endpoints

### Register
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "+1234567890",
  "role": "Driver"
}
```

### Login
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "...",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "Driver"
    }
  }
}
```

### Get Profile
```http
GET /api/v1/auth/profile
Authorization: Bearer <token>
```

### Update Profile
```http
PUT /api/v1/auth/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Updated",
  "phone": "+9876543210"
}
```

### Change Password
```http
PUT /api/v1/auth/change-password
Authorization: Bearer <token>
Content-Type: application/json

{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword123"
}
```

### Logout
```http
POST /api/v1/auth/logout
Authorization: Bearer <token>
```

### Verify Token
```http
POST /api/v1/auth/verify-token
Authorization: Bearer <token>
```

## Protected Routes

All routes below require authentication via Bearer token in the Authorization header.

### User Management (Admin Only)

#### Get All Users
```http
GET /api/v1/users
Authorization: Bearer <admin-token>
```

#### Get User by ID
```http
GET /api/v1/users/:id
Authorization: Bearer <admin-token>
```

#### Create User
```http
POST /api/v1/users
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "password123",
  "role": "Admin"
}
```

#### Update User
```http
PUT /api/v1/users/:id
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "name": "Jane Updated"
}
```

#### Delete User
```http
DELETE /api/v1/users/:id
Authorization: Bearer <admin-token>
```

## Role-Based Access Control

### Available Roles:
- `Admin` - Full system access
- `Driver` - Limited access to assigned routes

### Middleware Usage:

```javascript
import authMiddleware from './middleware/auth.js';
import { isAdmin, isDriver, isAdminOrDriver } from './middleware/role.js';

// Protect route with authentication
router.get('/protected', authMiddleware, controller);

// Restrict to Admin only
router.post('/admin-only', authMiddleware, isAdmin, controller);

// Restrict to Drivers only
router.get('/driver-only', authMiddleware, isDriver, controller);

// Allow Admin or Driver
router.get('/flexible', authMiddleware, isAdminOrDriver, controller);
```

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": "Please provide email and password"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "error": "Invalid email or password"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "error": "You do not have permission to access this resource"
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": "User not found"
}
```

## JWT Token Configuration

Configured in `.env`:
```env
JWT_SECRET=your_super_secret_key
JWT_EXPIRE=7d
```

## Security Features

✅ Password hashing with bcrypt
✅ JWT token authentication
✅ Role-based access control
✅ Protected routes middleware
✅ Token verification
✅ Secure password change flow
