import { api } from './api';
import { Trailer, ApiResponse, PaginatedResponse } from '../types';

export const trailerService = {
  async getAllTrailers(params?: { page?: number; limit?: number; status?: string; type?: string }): Promise<PaginatedResponse<Trailer>> {
    const response = await api.get<PaginatedResponse<Trailer>>('/trailers', { params });
    return response.data;
  },

  async getTrailerById(id: string): Promise<ApiResponse<Trailer>> {
    const response = await api.get<ApiResponse<Trailer>>(`/trailers/${id}`);
    return response.data;
  },

  async createTrailer(data: Partial<Trailer>): Promise<ApiResponse<Trailer>> {
    const response = await api.post<ApiResponse<Trailer>>('/trailers', data);
    return response.data;
  },

  async updateTrailer(id: string, data: Partial<Trailer>): Promise<ApiResponse<Trailer>> {
    const response = await api.put<ApiResponse<Trailer>>(`/trailers/${id}`, data);
    return response.data;
  },

  async deleteTrailer(id: string): Promise<ApiResponse<void>> {
    const response = await api.delete<ApiResponse<void>>(`/trailers/${id}`);
    return response.data;
  },

  async getAvailableTrailers(): Promise<PaginatedResponse<Trailer>> {
    const response = await api.get<PaginatedResponse<Trailer>>('/trailers/available');
    return response.data;
  },

  async searchTrailers(query: string): Promise<PaginatedResponse<Trailer>> {
    const response = await api.get<PaginatedResponse<Trailer>>('/trailers/search', { params: { q: query } });
    return response.data;
  },

  async getStatistics(): Promise<ApiResponse<any>> {
    const response = await api.get<ApiResponse<any>>('/trailers/statistics');
    return response.data;
  },
};
