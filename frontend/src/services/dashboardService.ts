import { api } from './api';

export interface DashboardStats {
  trucks: {
    total: number;
    available: number;
    inRoute: number;
    maintenance: number;
    outOfService: number;
  };
  trailers: {
    total: number;
    available: number;
    inUse: number;
    maintenance: number;
    byType?: Record<string, number>;
    byCondition?: Record<string, number>;
  };
  routes: {
    total: number;
    active: number;
    completed: number;
    cancelled: number;
    planned?: number;
    byStatus?: Record<string, number>;
    totalDistance?: number;
    totalFuel?: number;
    totalFuelCost?: number;
    avgFuelConsumption?: number;
  };
  maintenance: {
    pending: number;
    inProgress: number;
    completed: number;
  };
}

export const dashboardService = {
  async getStatistics(): Promise<DashboardStats> {
    const [trucks, trailers, routes] = await Promise.all([
      api.get('/trucks/statistics'),
      api.get('/trailers/statistics'),
      api.get('/routes/statistics')
    ]);

    const routeData = routes.data.data;
    const trailerData = trailers.data.data;

    return {
      trucks: trucks.data.data,
      trailers: {
        ...trailerData,
        inUse: trailerData.inUse || 0,
        maintenance: trailerData.maintenance || 0
      },
      routes: {
        total: routeData.total || 0,
        active: routeData.byStatus?.InProgress || 0,
        completed: routeData.byStatus?.Completed || 0,
        cancelled: routeData.byStatus?.Cancelled || 0,
        planned: routeData.byStatus?.Planned || 0,
        byStatus: routeData.byStatus,
        totalDistance: routeData.totalDistance || 0,
        totalFuel: routeData.totalFuel || 0,
        totalFuelCost: routeData.totalFuelCost || 0,
        avgFuelConsumption: routeData.avgFuelConsumption || 0
      },
      maintenance: {
        pending: 0,
        inProgress: trucks.data.data.maintenance || 0,
        completed: 0
      }
    };
  }
};
