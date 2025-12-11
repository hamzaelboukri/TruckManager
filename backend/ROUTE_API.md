# Route API Documentation

## Base URL
```
http://localhost:3000/api/v1/routes
```

## Authentication
All endpoints require authentication via JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## Endpoints

### 1. Get All Routes (Paginated)
```http
GET /api/v1/routes?page=1&limit=10&status=InProgress
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `sort` (optional): Sort field (default: '-createdAt')
- `status` (optional): Filter by status (Planned, InProgress, Completed, Cancelled)
- `driver` (optional): Filter by driver ID
- `truck` (optional): Filter by truck ID

**Authorization:** All authenticated users

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "674a1b2c3d4e5f6g7h8i9j0k",
      "routeNumber": "RT-2024-001",
      "driver": {
        "_id": "674a1b2c...",
        "firstName": "Ahmed",
        "lastName": "Benali"
      },
      "truck": {
        "_id": "674a1b2c...",
        "registrationNumber": "12345-A-67",
        "model": "Volvo FH16"
      },
      "description": "Livraison Casablanca - Marrakech",
      "departureLocation": "Casablanca",
      "arrivalLocation": "Marrakech",
      "distance": 240,
      "status": "InProgress",
      "departureKilometers": 125000,
      "createdAt": "2024-12-10T10:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "pages": 5
  }
}
```

---

### 2. Get Route by ID
```http
GET /api/v1/routes/:id
```

**Authorization:** All authenticated users

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "674a1b2c3d4e5f6g7h8i9j0k",
    "routeNumber": "RT-2024-001",
    "driver": { /* full driver object */ },
    "truck": { /* full truck object */ },
    "description": "Livraison Casablanca - Marrakech",
    "departureLocation": "Casablanca",
    "arrivalLocation": "Marrakech",
    "distance": 240,
    "departureKilometers": 125000,
    "arrivalKilometers": 125240,
    "fuelVolume": 85.5,
    "fuelCost": 1200,
    "vehicleRemarks": "RAS",
    "status": "Completed",
    "actualDistance": 240,
    "fuelConsumptionRate": 35.6,
    "createdAt": "2024-12-10T10:00:00.000Z",
    "updatedAt": "2024-12-10T18:00:00.000Z"
  }
}
```

---

### 3. Create Route (Admin Only)
```http
POST /api/v1/routes
```

**Authorization:** Admin only

**Request Body:**
```json
{
  "driver": "674a1b2c3d4e5f6a7b8c9d0e",
  "truck": "674b2c3d4e5f6a7b8c9d0e1f",
  "description": "Livraison Casablanca - Marrakech",
  "routeNumber": "RT-2024-001",
  "departureLocation": "Casablanca",
  "arrivalLocation": "Marrakech",
  "distance": 240
}u
```

**Note:** Use actual ObjectIds from your database. Get driver ID from `/api/v1/users?role=Driver` and truck ID from `/api/v1/trucks`
```

**Required Fields:**
- `driver`: Driver ObjectId
- `truck`: Truck ObjectId
- `description`: Route description
- `routeNumber`: Unique route number
- `departureLocation`: Starting location
- `arrivalLocation`: Destination
- `distance`: Estimated distance in km

**Response:**
```json
{
  "success": true,
  "message": "Route created successfully",
  "data": { /* created route */ }
}
```

---

### 4. Update Route (Admin Only)
```http
PUT /api/v1/routes/:id
```

**Authorization:** Admin only

**Request Body:**
```json
{
  "description": "Livraison urgente Casablanca - Marrakech",
  "distance": 245
}
```

**Response:**
```json
{
  "success": true,
  "message": "Route updated successfully",
  "data": { /* updated route */ }
}
```

---

### 5. Delete Route (Admin Only)
```http
DELETE /api/v1/routes/:id
```

**Authorization:** Admin only

**Response:**
```json
{
  "success": true,
  "message": "Route deleted successfully"
}
```

---

### 6. Start Route ⭐
```http
PATCH /api/v1/routes/:id/start
```

**Authorization:** Admin or assigned Driver

**Request Body:**
```json
{
  "departureKilometers": 125000
}
```

**Required:**
- `departureKilometers`: Truck odometer reading at departure

**Validations:**
- Route must be in 'Planned' status
- Truck must be 'Available'

**What Happens:**
1. Route status changes to 'InProgress'
2. Truck status changes to 'InRoute'
3. Departure kilometers are recorded

**Response:**
```json
{
  "success": true,
  "message": "Route started successfully",
  "data": {
    "_id": "674a1b2c3d4e5f6g7h8i9j0k",
    "status": "InProgress",
    "departureKilometers": 125000,
    /* ... other fields */
  }
}
```

---

### 7. Complete Route ⭐⭐⭐
```http
PATCH /api/v1/routes/:id/complete
```

**Authorization:** Admin or assigned Driver

**Request Body:**
```json
{
  "arrivalKilometers": 125240,
  "fuelVolume": 85.5,
  "fuelCost": 1200,
  "vehicleRemarks": "Freins à vérifier, pression pneu avant-gauche faible"
}
```

**Required:**
- `arrivalKilometers`: Truck odometer at arrival (must be > departureKilometers)

**Optional:**
- `fuelVolume`: Liters of fuel consumed
- `fuelCost`: Total fuel cost in MAD
- `vehicleRemarks`: Driver's notes about vehicle condition

**Validations:**
- Route must be in 'InProgress' status
- Departure kilometers must be set
- Arrival km must be greater than departure km

**Automatic Actions:**
1. ✅ Calculates actual distance: `arrivalKm - departureKm`
2. ✅ Updates route status to 'Completed'
3. ✅ Updates truck:
   - Adds actual distance to `currentKilometers`
   - Changes status to 'Available'
4. ✅ Updates all truck tires:
   - Adds distance to tire kilometers
   - Recalculates wear percentage (0-100%)
   - Updates tire status (Good/Warning/NeedReplacement)
5. ✅ Updates trailer (if truck has trailer attached):
   - Adds distance to trailer `currentKilometers`
6. ✅ Updates all trailer tires:
   - Adds distance to tire kilometers
   - Recalculates wear percentage

**Response:**
```json
{
  "success": true,
  "message": "Route completed successfully. Truck, trailer, and tires updated.",
  "data": {
    "_id": "674a1b2c3d4e5f6g7h8i9j0k",
    "status": "Completed",
    "departureKilometers": 125000,
    "arrivalKilometers": 125240,
    "fuelVolume": 85.5,
    "fuelCost": 1200,
    "vehicleRemarks": "Freins à vérifier",
    "actualDistance": 240,
    "fuelConsumptionRate": 35.6,
    /* ... other fields */
  }
}
```

---

### 8. Update Route Progress (Driver) ⭐
```http
PATCH /api/v1/routes/:id/progress
```

**Authorization:** Driver (own routes only) or Admin

**Request Body (all fields optional):**
```json
{
  "departureKilometers": 125000,
  "arrivalKilometers": 125240,
  "fuelVolume": 85.5,
  "fuelCost": 1200,
  "vehicleRemarks": "Pression pneu avant-gauche faible"
}
```

**Use Cases:**
1. **Record departure km:** Driver starts route and records odometer
2. **Update fuel during trip:** Driver adds fuel and updates volume/cost
3. **Add remarks:** Driver notes vehicle issues during trip
4. **Update arrival km:** Driver records final odometer

**Security:**
- Driver can only update their own assigned routes
- Only specified fields are updated (partial update)

**Example - Update Fuel During Trip:**
```bash
curl -X PATCH http://localhost:3000/api/v1/routes/<route_id>/progress \
  -H "Authorization: Bearer <driver_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "fuelVolume": 45.5,
    "fuelCost": 650
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Route progress updated successfully",
  "data": {
    "_id": "674a1b2c3d4e5f6a7b8c9d0e",
    "fuelVolume": 45.5,
    "fuelCost": 650,
    /* ... other fields */
  }
}
```

---

### 9. Get Routes by Status
```http
GET /api/v1/routes/status/:status
```

**Parameters:**
- `status`: Planned | InProgress | Completed | Cancelled

**Authorization:** All authenticated users

**Example:**
```http
GET /api/v1/routes/status/InProgress
```

**Response:**
```json
{
  "success": true,
  "count": 5,
  "data": [ /* array of routes */ ]
}
```

---

### 10. Get Routes by Driver
```http
GET /api/v1/routes/driver/:driverId
```

**Authorization:** 
- Drivers can only view their own routes
- Admins can view any driver's routes

**Response:**
```json
{
  "success": true,
  "count": 12,
  "data": [ /* array of driver's routes */ ]
}
```

---

### 11. Get Routes by Truck
```http
GET /api/v1/routes/truck/:truckId
```

**Authorization:** All authenticated users

**Response:**
```json
{
  "success": true,
  "count": 8,
  "data": [ /* array of truck's routes */ ]
}
```

---

### 12. Get My Routes (Driver)
```http
GET /api/v1/routes/my-routes
```

**Authorization:** Driver only (uses JWT to identify driver)

**Response:**
```json
{
  "success": true,
  "count": 7,
  "data": [ /* array of authenticated driver's routes */ ]
}
```

---

### 13. Get Route Statistics
```http
GET /api/v1/routes/statistics
```

**Authorization:** All authenticated users

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 156,
    "byStatus": {
      "Planned": 12,
      "InProgress": 5,
      "Completed": 134,
      "Cancelled": 5
    },
    "totalDistance": 45680,
    "totalFuel": 15234.5,
    "totalFuelCost": 213425,
    "avgFuelConsumption": 33.37
  }
}
```

---

## Getting Real IDs

### Get Driver IDs
```bash
curl -X GET "http://localhost:3000/api/v1/users?role=Driver" \
  -H "Authorization: Bearer <token>"
```

### Get Truck IDs
```bash
curl -X GET "http://localhost:3000/api/v1/trucks?status=Available" \
  -H "Authorization: Bearer <token>"
```

### Get Route IDs
```bash
curl -X GET "http://localhost:3000/api/v1/routes/my-routes" \
  -H "Authorization: Bearer <driver_token>"
```

---

## Complete Workflow Example

### Step 1: Admin Creates Route
```bash
# First, get available drivers
curl -X GET http://localhost:3000/api/v1/users?role=Driver \
  -H "Authorization: Bearer <admin_token>"

# Get available trucks
curl -X GET http://localhost:3000/api/v1/trucks?status=Available \
  -H "Authorization: Bearer <admin_token>"

# Then create route with real IDs
curl -X POST http://localhost:3000/api/v1/routes \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "driver": "674a1b2c3d4e5f6a7b8c9d0e",
    "truck": "674b2c3d4e5f6a7b8c9d0e1f",
    "description": "Livraison Casablanca - Marrakech",
    "routeNumber": "RT-2024-001",
    "departureLocation": "Casablanca",
    "arrivalLocation": "Marrakech",
    "distance": 240
  }'
```
**Result:** Route created with status `Planned`

---

### Step 2: Driver Starts Route
```bash
curl -X PATCH http://localhost:3000/api/v1/routes/<route_id>/start \
  -H "Authorization: Bearer <driver_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "departureKilometers": 125000
  }'
```
**Result:** 
- Route status: `InProgress`
- Truck status: `InRoute`
- Departure km recorded: 125000

---

### Step 3: Driver Completes Route
```bash
curl -X PATCH http://localhost:3000/api/v1/routes/<route_id>/complete \
  -H "Authorization: Bearer <driver_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "arrivalKilometers": 125240,
    "fuelVolume": 85.5,
    "fuelCost": 1200,
    "vehicleRemarks": "RAS - véhicule en bon état"
  }'
```
**Result:**
- Route status: `Completed`
- Truck status: `Available`
- Truck kilometers: +240 km (now 125240)
- Trailer kilometers: +240 km (if attached)
- All tires: +240 km with wear recalculation
- Fuel consumption: 35.6 L/100km

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Arrival kilometers must be greater than departure kilometers"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "You can only view your own routes"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Route not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Error fetching routes",
  "error": "Database connection failed"
}
```

---

## Best Practices

### 1. Always Start Before Completing
```javascript
// ❌ Wrong
await completeRoute(routeId, data);

// ✅ Correct
await startRoute(routeId, departureKm);
// ... driver performs route ...
await completeRoute(routeId, data);
```

### 2. Validate Kilometers
```javascript
// Frontend validation
if (arrivalKm <= departureKm) {
  alert("Arrival km must be greater than departure km");
  return;
}
```

### 3. Capture Accurate Fuel Data
```javascript
// Get from fuel receipts
const fuelData = {
  fuelVolume: 85.5,      // From pump
  fuelCost: 1200,        // Actual amount paid
  vehicleRemarks: "Pression pneu faible avant-gauche"
};
```

### 4. Handle Driver Authorization
```javascript
// Check if driver can modify this route
| PATCH /routes/:id/start | ✅ | ✅ Own only |
| PATCH /routes/:id/complete | ✅ | ✅ Own only |
| PATCH /routes/:id/progress | ✅ | ✅ Own only |
| GET /routes/my-routes | ❌ | ✅ |
| GET /routes/driver/:id | ✅ | ✅ Own only |

### 5. Use Pagination for Lists
```javascript
// Get routes in batches
const routes = await fetch('/api/v1/routes?page=1&limit=20');
```

---

## Role-Based Access

| Endpoint | Admin | Driver |
|----------|-------|--------|
| GET /routes | ✅ All | ✅ All |
| GET /routes/:id | ✅ | ✅ |
| POST /routes | ✅ | ❌ |
| PUT /routes/:id | ✅ | ❌ |
| DELETE /routes/:id | ✅ | ❌ |
| PATCH /routes/:id/start | ✅ | ✅ Own only |
| PATCH /routes/:id/complete | ✅ | ✅ Own only |
| GET /routes/my-routes | ❌ | ✅ |
| GET /routes/driver/:id | ✅ | ✅ Own only |

---

## Frontend Integration Examples

### React/Vue Example
```javascript
// Complete route
const completeRoute = async (routeId, data) => {
  try {
    const response = await fetch(`/api/v1/routes/${routeId}/complete`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    const result = await response.json();
    
    if (result.success) {
      alert('Route completed! Truck and tires updated automatically.');
    }
  } catch (error) {
    console.error('Error:', error);
  }
};

// Usage
await completeRoute(routeId, {
  arrivalKilometers: 125240,
  fuelVolume: 85.5,
  fuelCost: 1200,
  vehicleRemarks: "RAS"
});
```

---

## Testing with Postman

### Collection Variables
```
base_url: http://localhost:3000/api/v1
admin_token: <your_admin_jwt>
driver_token: <your_driver_jwt>
```

### Test Sequence
1. Login as Admin → Save token
2. Create route → Save route ID
3. Login as Driver → Save token
4. Start route with departure km
5. Complete route with arrival km and fuel data
6. Verify truck kilometers increased
7. Verify tire wear updated

---

## Performance Tips

1. **Use pagination** for large result sets
2. **Filter at API level** instead of client-side
3. **Cache statistics** for dashboard (5-minute cache)
4. **Index database fields**: routeNumber, status, driver, truck
5. **Batch updates** for multiple tires (already implemented)

---

## Version
- API Version: 1.0.0
- Last Updated: December 10, 2025
- Base Path: /api/v1/routes
