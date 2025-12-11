# Route Service Documentation

## Overview
The Route Service manages route operations including creation, tracking, completion, and automatic updates to trucks, trailers, and tires.

## Features
- ✅ Complete route lifecycle management (Planned → InProgress → Completed)
- ✅ Automatic fuel consumption tracking
- ✅ Driver remarks and vehicle condition recording
- ✅ Automatic kilometers update for trucks, trailers, and tires
- ✅ Tire wear calculation on route completion
- ✅ Route statistics with fuel consumption analytics

---

## Methods

### 1. Create Route
```javascript
async createRoute(routeData)
```
**Description:** Creates a new route with unique route number.

**Parameters:**
```javascript
{
  driver: ObjectId,           // Driver ID (required)
  truck: ObjectId,            // Truck ID (required)
  description: String,        // Route description (required)
  routeNumber: String,        // Unique route number (required)
  departureLocation: String,  // Starting location (required)
  arrivalLocation: String,    // Destination (required)
  distance: Number           // Estimated distance in km (required)
}
```

**Returns:** Created route with populated driver and truck

**Example:**
```javascript
const route = await routeService.createRoute({
  driver: "674a1b2c3d4e5f6g7h8i9j0k",
  truck: "674a1b2c3d4e5f6g7h8i9j0l",
  description: "Livraison Casablanca - Marrakech",
  routeNumber: "RT-2024-001",
  departureLocation: "Casablanca",
  arrivalLocation: "Marrakech",
  distance: 240
});
```

---

### 2. Get Route by ID
```javascript
async getRouteById(routeId)
```
**Description:** Retrieves a single route with populated driver and truck details.

**Parameters:**
- `routeId`: Route ObjectId

**Returns:** Route object

**Example:**
```javascript
const route = await routeService.getRouteById("674a1b2c3d4e5f6g7h8i9j0m");
```

---

### 3. Get All Routes
```javascript
async getAllRoutes(filters = {}, options = {})
```
**Description:** Retrieves all routes with pagination and filtering.

**Parameters:**
```javascript
filters = {
  status: String,      // Filter by status
  driver: ObjectId,    // Filter by driver
  truck: ObjectId      // Filter by truck
}

options = {
  page: Number,        // Page number (default: 1)
  limit: Number,       // Items per page (default: 10)
  sort: String         // Sort field (default: '-createdAt')
}
```

**Returns:**
```javascript
{
  routes: Array,       // Array of routes
  total: Number,       // Total count
  page: Number,        // Current page
  pages: Number        // Total pages
}
```

**Example:**
```javascript
const result = await routeService.getAllRoutes(
  { status: 'InProgress' },
  { page: 1, limit: 20, sort: '-createdAt' }
);
```

---

### 4. Get Routes by Status
```javascript
async getRoutesByStatus(status)
```
**Description:** Retrieves routes filtered by status.

**Parameters:**
- `status`: String ('Planned', 'InProgress', 'Completed', 'Cancelled')

**Returns:** Array of routes

**Example:**
```javascript
const plannedRoutes = await routeService.getRoutesByStatus('Planned');
```

---

### 5. Update Route
```javascript
async updateRoute(routeId, updateData)
```
**Description:** Updates route information.

**Parameters:**
- `routeId`: Route ObjectId
- `updateData`: Object with fields to update

**Returns:** Updated route

**Example:**
```javascript
const updated = await routeService.updateRoute(routeId, {
  description: "Livraison urgente",
  distance: 250
});
```

---

### 6. Delete Route
```javascript
async deleteRoute(routeId)
```
**Description:** Deletes a route.

**Parameters:**
- `routeId`: Route ObjectId

**Returns:** Deleted route

**Example:**
```javascript
await routeService.deleteRoute(routeId);
```

---

### 7. Start Route
```javascript
async startRoute(routeId, departureKilometers)
```
**Description:** Starts a route by recording departure kilometers and updating truck status to 'InRoute'.

**Parameters:**
- `routeId`: Route ObjectId
- `departureKilometers`: Number - Truck odometer reading at departure

**Validations:**
- Route must be in 'Planned' status
- Truck must be 'Available'

**Automatic Actions:**
- Changes route status to 'InProgress'
- Changes truck status to 'InRoute'
- Records departure kilometers

**Returns:** Updated route

**Example:**
```javascript
const route = await routeService.startRoute(
  "674a1b2c3d4e5f6g7h8i9j0m",
  125000  // Departure odometer reading
);
```

---

### 8. Complete Route ⭐
```javascript
async completeRoute(routeId, payload)
```
**Description:** Completes a route with fuel data and automatically updates truck, trailer, and all tires.

**Parameters:**
```javascript
{
  arrivalKilometers: Number,    // Odometer at arrival (required)
  fuelVolume: Number,           // Liters consumed (optional)
  fuelCost: Number,             // Fuel cost in MAD (optional)
  vehicleRemarks: String        // Driver notes (optional)
}
```

**Validations:**
- Route must be in 'InProgress' status
- Departure kilometers must be set
- Arrival km must be > departure km

**Automatic Actions:**
1. ✅ Calculates actual distance: `arrivalKm - departureKm`
2. ✅ Updates route status to 'Completed'
3. ✅ Updates truck:
   - Adds actual distance to truck kilometers
   - Changes truck status to 'Available'
4. ✅ Updates all truck tires:
   - Adds distance to tire kilometers
   - Recalculates wear percentage
   - Updates tire status (Good/Warning/NeedReplacement)
5. ✅ Updates trailer (if attached):
   - Adds distance to trailer kilometers
6. ✅ Updates all trailer tires:
   - Adds distance to tire kilometers
   - Recalculates wear percentage

**Returns:** Completed route

**Example:**
```javascript
const completedRoute = await routeService.completeRoute(
  "674a1b2c3d4e5f6g7h8i9j0m",
  {
    arrivalKilometers: 125240,     // Odometer at arrival
    fuelVolume: 85.5,              // 85.5 liters consumed
    fuelCost: 1200,                // 1200 MAD spent
    vehicleRemarks: "Freins à vérifier, pression pneu avant-gauche faible"
  }
);

// Result:
// - Actual distance: 240 km (125240 - 125000)
// - Fuel consumption: 35.6 L/100km
// - Truck kilometers: +240 km
// - Trailer kilometers: +240 km (if attached)
// - All tires: +240 km with wear recalculation
```

---

### 9. Get Routes by Driver
```javascript
async getRoutesByDriver(driverId)
```
**Description:** Retrieves all routes assigned to a specific driver.

**Parameters:**
- `driverId`: Driver ObjectId

**Returns:** Array of routes sorted by most recent

**Example:**
```javascript
const driverRoutes = await routeService.getRoutesByDriver(driverId);
```

---

### 10. Get Routes by Truck
```javascript
async getRoutesByTruck(truckId)
```
**Description:** Retrieves all routes for a specific truck.

**Parameters:**
- `truckId`: Truck ObjectId

**Returns:** Array of routes sorted by most recent

**Example:**
```javascript
const truckRoutes = await routeService.getRoutesByTruck(truckId);
```

---

### 11. Get Route Statistics
```javascript
async getRouteStatistics()
```
**Description:** Retrieves comprehensive route statistics including fuel analytics.

**Returns:**
```javascript
{
  total: Number,                    // Total routes
  byStatus: {
    Planned: Number,
    InProgress: Number,
    Completed: Number,
    Cancelled: Number
  },
  totalDistance: Number,            // Total km completed
  totalFuel: Number,                // Total liters consumed
  totalFuelCost: Number,            // Total fuel cost (MAD)
  avgFuelConsumption: Number        // Average L/100km
}
```

**Example:**
```javascript
const stats = await routeService.getRouteStatistics();

console.log(`Total routes: ${stats.total}`);
console.log(`Completed: ${stats.byStatus.Completed}`);
console.log(`Total distance: ${stats.totalDistance} km`);
console.log(`Average consumption: ${stats.avgFuelConsumption.toFixed(2)} L/100km`);
```

---

## Route Model Fields

```javascript
{
  driver: ObjectId,                 // Ref: Driver
  truck: ObjectId,                  // Ref: Truck
  description: String,              // Route description
  routeNumber: String,              // Unique identifier
  departureLocation: String,        // Starting point
  arrivalLocation: String,          // Destination
  distance: Number,                 // Estimated distance (km)
  
  // Kilometers tracking
  departureKilometers: Number,      // Odometer at start
  arrivalKilometers: Number,        // Odometer at end
  
  // Fuel tracking
  fuelVolume: Number,               // Liters consumed
  fuelCost: Number,                 // Cost in MAD
  
  // Driver notes
  vehicleRemarks: String,           // Vehicle condition notes
  
  // Status
  status: String,                   // Planned, InProgress, Completed, Cancelled
  
  // Timestamps
  createdAt: Date,
  updatedAt: Date
}
```

---

## Virtual Fields

### actualDistance
```javascript
route.actualDistance  // arrivalKilometers - departureKilometers
```

### fuelConsumptionRate
```javascript
route.fuelConsumptionRate  // (fuelVolume / actualDistance) * 100 (L/100km)
```

---

## Complete Workflow Example

```javascript
// 1. Create route
const route = await routeService.createRoute({
  driver: driverId,
  truck: truckId,
  description: "Livraison Casablanca - Marrakech",
  routeNumber: "RT-2024-001",
  departureLocation: "Casablanca",
  arrivalLocation: "Marrakech",
  distance: 240
});
// Status: Planned

// 2. Driver starts route
await routeService.startRoute(route._id, 125000);
// Status: InProgress
// Truck status: InRoute
// departureKilometers: 125000

// 3. Driver completes route
await routeService.completeRoute(route._id, {
  arrivalKilometers: 125240,
  fuelVolume: 85.5,
  fuelCost: 1200,
  vehicleRemarks: "RAS - véhicule en bon état"
});
// Status: Completed
// Truck status: Available
// Truck kilometers: +240 km
// Trailer kilometers: +240 km (if attached)
// All tires: +240 km with wear updates
// Actual distance: 240 km
// Fuel consumption: 35.6 L/100km
```

---

## Error Handling

All methods throw errors that should be caught:

```javascript
try {
  await routeService.completeRoute(routeId, data);
} catch (error) {
  // Possible errors:
  // - "Route not found"
  // - "Route must be in progress to complete"
  // - "Departure kilometers not set. Start the route first"
  // - "Arrival kilometers must be greater than departure kilometers"
}
```

---

## Integration with Other Services

### Dependencies
- **truckService**: Updates truck kilometers and status
- **trailerService**: Updates trailer kilometers
- **tireService**: Updates tire kilometers and wear

### Used By
- **routeController**: HTTP API endpoints
- **driverController**: Driver's route management
- **reportService**: Route-based reporting

---

## Best Practices

1. **Always start route before completing:**
   ```javascript
   await routeService.startRoute(routeId, departureKm);
   // ... route in progress ...
   await routeService.completeRoute(routeId, data);
   ```

2. **Validate kilometers:**
   ```javascript
   // Ensure arrival > departure
   if (arrivalKm <= departureKm) {
     throw new Error("Invalid kilometers");
   }
   ```

3. **Record accurate fuel data:**
   ```javascript
   // Get from driver input
   const fuelData = {
     fuelVolume: 85.5,      // From fuel receipts
     fuelCost: 1200,        // Actual cost paid
     vehicleRemarks: "..."  // Driver observations
   };
   ```

4. **Check route status before operations:**
   ```javascript
   const route = await routeService.getRouteById(routeId);
   if (route.status !== 'Planned') {
     throw new Error("Cannot start route");
   }
   ```

---

## Performance Notes

- Uses pagination for `getAllRoutes()` to handle large datasets
- Populates only necessary fields (driver, truck)
- Batch updates tires to minimize database calls
- Aggregation pipelines for statistics

---

## Testing

```javascript
import routeService from './routeService.js';

// Test complete workflow
describe('Route Complete Workflow', () => {
  it('should update all entities on route completion', async () => {
    const route = await routeService.createRoute(routeData);
    await routeService.startRoute(route._id, 100000);
    
    const completed = await routeService.completeRoute(route._id, {
      arrivalKilometers: 100500,
      fuelVolume: 150,
      fuelCost: 2100
    });
    
    expect(completed.status).toBe('Completed');
    expect(completed.actualDistance).toBe(500);
    
    // Verify truck updated
    const truck = await truckService.getTruckById(route.truck);
    expect(truck.status).toBe('Available');
  });
});
```

---

## API Endpoints (Reference)

```
POST   /api/v1/routes                    - Create route
GET    /api/v1/routes                    - Get all routes (paginated)
GET    /api/v1/routes/:id                - Get route by ID
PUT    /api/v1/routes/:id                - Update route
DELETE /api/v1/routes/:id                - Delete route
PATCH  /api/v1/routes/:id/start          - Start route
PATCH  /api/v1/routes/:id/complete       - Complete route
GET    /api/v1/routes/status/:status     - Get routes by status
GET    /api/v1/routes/driver/:driverId   - Get driver's routes
GET    /api/v1/routes/truck/:truckId     - Get truck's routes
GET    /api/v1/routes/statistics         - Get route statistics
```

---

## Version
- Service Version: 1.0.0
- Last Updated: December 10, 2025
- Node.js: v22.12.0
- MongoDB: 7.0
