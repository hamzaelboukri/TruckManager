import {api} from './api';

export interface RouteData {
  _id?: string;
  routeNumber?: string;
  departure: string;
  arrival: string;
  departureCoords?: { lat: number; lng: number };
  arrivalCoords?: { lat: number; lng: number };
  distance: number;
  estimatedDuration: string;
  fuelConsumption?: number;
  fuelVolume?: number;
  fuelCost?: number;
  truck: string;
  driver: string;
  status: 'Planned' | 'InProgress' | 'Completed' | 'Cancelled';
  departureKilometers?: number;
  arrivalKilometers?: number;
  vehicleRemarks?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface RouteStatistics {
  total: number;
  byStatus: {
    Planned?: number;
    InProgress?: number;
    Completed?: number;
    Cancelled?: number;
  };
  totalDistance: number;
  totalFuel: number;
  totalFuelCost: number;
  avgFuelConsumption: number;
}

class RouteService {
  // Get all routes with pagination and filters
  async getAllRoutes(options?: {
    page?: number;
    limit?: number;
    sort?: string;
    status?: string;
  }) {
    const params = new URLSearchParams();
    
    if (options?.page) params.append('page', options.page.toString());
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.sort) params.append('sort', options.sort);
    if (options?.status) params.append('status', options.status);

    const response = await api.get(`/routes?${params.toString()}`);
    return response.data;
  }

  // Get route by ID
  async getRouteById(routeId: string) {
    const response = await api.get(`/routes/${routeId}`);
    return response.data;
  }

  // Create new route
  async createRoute(routeData: RouteData) {
    const response = await api.post('/routes', routeData);
    return response.data;
  }

  // Update route
  async updateRoute(routeId: string, routeData: Partial<RouteData>) {
    const response = await api.put(`/routes/${routeId}`, routeData);
    return response.data;
  }

  // Delete route
  async deleteRoute(routeId: string) {
    const response = await api.delete(`/routes/${routeId}`);
    return response.data;
  }

  // Get routes by status
  async getRoutesByStatus(status: string) {
    const response = await api.get(`/routes/status/${status}`);
    return response.data;
  }

  // Start a route
  async startRoute(routeId: string, departureKilometers: number) {
    const response = await api.post(`/routes/${routeId}/start`, {
      departureKilometers
    });
    return response.data;
  }

  // Complete a route
  async completeRoute(routeId: string, data: {
    arrivalKilometers: number;
    fuelVolume?: number;
    fuelCost?: number;
    vehicleRemarks?: string;
  }) {
    const response = await api.post(`/routes/${routeId}/complete`, data);
    return response.data;
  }

  // Get routes by driver
  async getRoutesByDriver(driverId: string) {
    const response = await api.get(`/routes/driver/${driverId}`);
    return response.data;
  }

  // Get routes by truck
  async getRoutesByTruck(truckId: string) {
    const response = await api.get(`/routes/truck/${truckId}`);
    return response.data;
  }

  // Get route statistics
  async getRouteStatistics(): Promise<RouteStatistics> {
    const response = await api.get('/routes/statistics');
    return response.data;
  }
}

export const routeService = new RouteService();
