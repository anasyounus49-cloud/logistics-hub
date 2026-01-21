import apiClient from '../config/axiosConfig';
import { ENDPOINTS } from '../config/endpoints';
import { Weight, WeightCreate, WeightOut } from '../types/trip.types';
import { PaginationParams } from '../types/common.types';

export const weightService = {
  async getAll(params?: PaginationParams): Promise<WeightOut[]> {
    const response = await apiClient.get<WeightOut[]>(ENDPOINTS.WEIGHTS.LIST, { params });
    return response.data;
  },

  async getByTrip(tripId: number): Promise<WeightOut[]> {
    const response = await apiClient.get<WeightOut[]>(ENDPOINTS.WEIGHTS.BY_TRIP(tripId));
    return response.data;
  },

  async getGross(tripId: number): Promise<WeightOut> {
    const response = await apiClient.get<WeightOut>(ENDPOINTS.WEIGHTS.GROSS(tripId));
    return response.data;
  },

  async getTare(tripId: number): Promise<WeightOut> {
    const response = await apiClient.get<WeightOut>(ENDPOINTS.WEIGHTS.TARE(tripId));
    return response.data;
  },

  async getById(id: number): Promise<WeightOut> {
    const response = await apiClient.get<WeightOut>(ENDPOINTS.WEIGHTS.BY_ID(id));
    return response.data;
  },

  async create(data: WeightCreate): Promise<WeightOut> {
    const response = await apiClient.post<WeightOut>(ENDPOINTS.WEIGHTS.LIST, data);
    return response.data;
  },

  async update(id: number, data: WeightCreate): Promise<WeightOut> {
    const response = await apiClient.put<WeightOut>(ENDPOINTS.WEIGHTS.BY_ID(id), data);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(ENDPOINTS.WEIGHTS.BY_ID(id));
  },
};
