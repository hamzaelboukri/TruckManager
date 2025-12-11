import { api } from './api';
import { Truck, ApiResponse, PaginatedResponse } from '../types';

export const truckService = {
  async getAllTrucks(params?: { page?: number; limit?: number; status?: string }): Promise<PaginatedResponse<Truck>> {
    const response = await api.get<PaginatedResponse<Truck>>('/trucks', { params });
    return response.data;
  },

  async getTruckById(id: string): Promise<ApiResponse<Truck>> {
    const response = await api.get<ApiResponse<Truck>>(`/trucks/${id}`);
    return response.data;
  },

  async createTruck(data: Partial<Truck>): Promise<ApiResponse<Truck>> {
    const response = await api.post<ApiResponse<Truck>>('/trucks', data);
    return response.data;
  },

  async updateTruck(id: string, data: Partial<Truck>): Promise<ApiResponse<Truck>> {
    const response = await api.put<ApiResponse<Truck>>(`/trucks/${id}`, data);
    return response.data;
  },

  async deleteTruck(id: string): Promise<ApiResponse<void>> {
    const response = await api.delete<ApiResponse<void>>(`/trucks/${id}`);
    return response.data;
  },

  async getTrucksByStatus(status: string): Promise<PaginatedResponse<Truck>> {
    const response = await api.get<PaginatedResponse<Truck>>(`/trucks/status/${status}`);
    return response.data;
  },

  async getAvailableTrucks(): Promise<PaginatedResponse<Truck>> {
    const response = await api.get<PaginatedResponse<Truck>>('/trucks/available');
    return response.data;
  },

  async updateKilometers(id: string, kilometers: number): Promise<ApiResponse<Truck>> {
    const response = await api.patch<ApiResponse<Truck>>(`/trucks/${id}/kilometers`, { currentKilometers: kilometers });
    return response.data;
  },

  async updateFuelLevel(id: string, fuelLevel: number): Promise<ApiResponse<Truck>> {
    const response = await api.patch<ApiResponse<Truck>>(`/trucks/${id}/fuel`, { currentFuelLevel: fuelLevel });
    return response.data;
  },
};
