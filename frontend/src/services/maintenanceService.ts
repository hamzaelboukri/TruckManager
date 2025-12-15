import { api } from './api';

export interface MaintenanceRecord {
  _id: string;
  vehicleType: 'Truck' | 'Trailer' | 'Tire';
  vehicleId: string | any;
  maintenanceType: string;
  date: string;
  kilometersAtMaintenance: number;
  cost: number;
  performedBy: string;
  workshop?: string;
  description: string;
  partsReplaced?: {
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

export interface PaginatedResponse<T> {
  success: boolean;
  records?: T[];
  data?: T[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export const maintenanceService = {
  // Records
  async getAllRecords(params?: {
    page?: number;
    limit?: number;
    vehicleType?: string;
    maintenanceType?: string;
    status?: string;
    priority?: string;
  }): Promise<PaginatedResponse<MaintenanceRecord>> {
    const response = await api.get<PaginatedResponse<MaintenanceRecord>>('/maintenance/records', { params });
    return response.data;
  },

  async getRecordById(id: string): Promise<ApiResponse<MaintenanceRecord>> {
    const response = await api.get<ApiResponse<MaintenanceRecord>>(`/maintenance/records/${id}`);
    return response.data;
  },

  async createRecord(data: Partial<MaintenanceRecord>): Promise<ApiResponse<MaintenanceRecord>> {
    const response = await api.post<ApiResponse<MaintenanceRecord>>('/maintenance/records', data);
    return response.data;
  },

  async updateRecord(id: string, data: Partial<MaintenanceRecord>): Promise<ApiResponse<MaintenanceRecord>> {
    const response = await api.put<ApiResponse<MaintenanceRecord>>(`/maintenance/records/${id}`, data);
    return response.data;
  },

  async deleteRecord(id: string): Promise<ApiResponse<void>> {
    const response = await api.delete<ApiResponse<void>>(`/maintenance/records/${id}`);
    return response.data;
  },

  async getVehicleHistory(vehicleType: string, vehicleId: string, params?: { page?: number; limit?: number }): Promise<PaginatedResponse<MaintenanceRecord>> {
    const response = await api.get<PaginatedResponse<MaintenanceRecord>>(`/maintenance/records/vehicle/${vehicleType}/${vehicleId}`, { params });
    return response.data;
  },

  async getUpcomingMaintenance(params?: { page?: number; limit?: number }): Promise<PaginatedResponse<MaintenanceRecord>> {
    const response = await api.get<PaginatedResponse<MaintenanceRecord>>('/maintenance/records/upcoming', { params });
    return response.data;
  },

  async getOverdueMaintenance(params?: { page?: number; limit?: number }): Promise<PaginatedResponse<MaintenanceRecord>> {
    const response = await api.get<PaginatedResponse<MaintenanceRecord>>('/maintenance/records/overdue', { params });
    return response.data;
  },

  async updateRecordStatus(id: string, status: string): Promise<ApiResponse<MaintenanceRecord>> {
    const response = await api.patch<ApiResponse<MaintenanceRecord>>(`/maintenance/records/${id}/status`, { status });
    return response.data;
  },

  async checkDueMaintenance(vehicleType: string, vehicleId: string, autoCreate: boolean = false): Promise<any> {
    const response = await api.get(`/maintenance/due/${vehicleType}/${vehicleId}`, {
      params: { autoCreate: autoCreate.toString() }
    });
    return response.data;
  },

  async checkAllDueMaintenance(autoCreate: boolean = false): Promise<any> {
    const response = await api.get('/maintenance/due-all', {
      params: { autoCreate: autoCreate.toString() }
    });
    return response.data;
  },
};
