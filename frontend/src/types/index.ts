export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Driver';
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  data?: {
    token: string;
    user: User;
  };
  error?: string;
}

export interface Truck {
  _id: string;
  registrationNumber: string;
  brand: string;
  model: string;
  year: number;
  status: 'Available' | 'InUse' | 'Maintenance' | 'OutOfService';
  condition: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  currentKilometers: number;
  fuelCapacity: number;
  currentFuelLevel: number;
  lastMaintenanceDate?: string;
  nextMaintenanceKilometers?: number;
  driver?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Trailer {
  _id: string;
  registrationNumber: string;
  brand: string;
  model: string;
  type: 'Flatbed' | 'Refrigerated' | 'Tanker' | 'Container' | 'Van' | 'Other';
  year: number;
  maxCapacity: number;
  currentKilometers: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  numberOfAxles: number;
  status: 'Available' | 'InUse' | 'Maintenance' | 'OutOfService';
  condition: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  tires: Tire[];
  createdAt: string;
  updatedAt: string;
}

export interface Tire {
  _id: string;
  serialNumber: string;
  brand: string;
  model: string;
  size: string;
  position: string;
  ownerType: 'Truck' | 'Trailer';
  vehicle: string;
  currentWearPercentage: number;
  status: 'Good' | 'Warning' | 'NeedReplacement';
  purchaseDate: string;
  installationKilometers: number;
  currentKilometers: number;
  createdAt: string;
  updatedAt: string;
}

export interface Route {
  _id: string;
  routeNumber: string;
  driver: User;
  truck: Truck;
  trailer?: Trailer;
  startLocation: {
    address: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  endLocation: {
    address: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  distance: number;
  estimatedDuration: number;
  status: 'Planned' | 'InProgress' | 'Completed' | 'Cancelled';
  startDate: string;
  endDate?: string;
  actualStartDate?: string;
  actualEndDate?: string;
  fuelTracking: {
    fuelVolume: number;
    fuelCost: number;
  }[];
  kilometerTracking: number[];
  vehicleRemarks: string[];
  cargo?: {
    description: string;
    weight: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface MaintenanceRule {
  _id: string;
  vehicleType: 'Truck' | 'Trailer' | 'Tire';
  vehicleId: string;
  maintenanceType: string;
  intervalKilometers: number;
  intervalMonths: number;
  estimatedCost: number;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MaintenanceRecord {
  _id: string;
  vehicleType: 'Truck' | 'Trailer' | 'Tire';
  vehicleId: string;
  maintenanceType: string;
  date: string;
  kilometersAtMaintenance: number;
  cost: number;
  performedBy: string;
  workshop?: string;
  description: string;
  partsReplaced: {
    partName: string;
    partNumber?: string;
    quantity: number;
    cost: number;
  }[];
  nextMaintenanceKilometers?: number;
  nextMaintenanceDate?: string;
  status: 'Scheduled' | 'InProgress' | 'Completed' | 'Cancelled';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data?: T[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}
