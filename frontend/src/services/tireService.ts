import { api } from './api';
import type { Tire, ApiResponse, PaginatedResponse } from '../types';

export const tireService = {
  async getAllTires(params?: { page?: number; limit?: number; status?: string; ownerType?: string }): Promise<PaginatedResponse<Tire>> {
    const response = await api.get<PaginatedResponse<Tire>>('/tires', { params });
    return response.data;
  },

  async getTireById(id: string): Promise<ApiResponse<Tire>> {
    const response = await api.get<ApiResponse<Tire>>(`/tires/${id}`);
    return response.data;
  },

  async createTire(data: Partial<Tire>): Promise<ApiResponse<Tire>> {
    const response = await api.post<ApiResponse<Tire>>('/tires', data);
    return response.data;
  },

  async updateTire(id: string, data: Partial<Tire>): Promise<ApiResponse<Tire>> {
    const response = await api.put<ApiResponse<Tire>>(`/tires/${id}`, data);
    return response.data;
  },

  async deleteTire(id: string): Promise<ApiResponse<void>> {
    const response = await api.delete<ApiResponse<void>>(`/tires/${id}`);
    return response.data;
  },

  async getTiresByStatus(status: string): Promise<PaginatedResponse<Tire>> {
    const response = await api.get<PaginatedResponse<Tire>>(`/tires/status/${status}`);
    return response.data;
  },

  async getTiresByVehicle(vehicleId: string, ownerType: 'Truck' | 'Trailer' = 'Truck'): Promise<PaginatedResponse<Tire>> {
    const response = await api.get<PaginatedResponse<Tire>>(`/tires/vehicle/${ownerType}/${vehicleId}`);
    return response.data;
  },

  async updateWear(id: string, wearPercentage: number): Promise<ApiResponse<Tire>> {
    const response = await api.patch<ApiResponse<Tire>>(`/tires/${id}/wear`, { currentWearPercentage: wearPercentage });
    return response.data;
  },
};
