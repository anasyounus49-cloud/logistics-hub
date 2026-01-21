import apiClient from '../config/axiosConfig';
import { ENDPOINTS } from '../config/endpoints';
import { MaterialUnloading, MaterialUnloadingCreate, MaterialUnloadingOut } from '../types/trip.types';
import { PaginationParams } from '../types/common.types';

export const unloadingService = {
  async getAll(params?: PaginationParams): Promise<MaterialUnloadingOut[]> {
    const response = await apiClient.get<MaterialUnloadingOut[]>(ENDPOINTS.UNLOADING.LIST, { params });
    return response.data;
  },

  async getWithRejections(): Promise<MaterialUnloadingOut[]> {
    const response = await apiClient.get<MaterialUnloadingOut[]>(ENDPOINTS.UNLOADING.WITH_REJECTIONS);
    return response.data;
  },

  async getByTrip(tripId: number): Promise<MaterialUnloadingOut[]> {
    const response = await apiClient.get<MaterialUnloadingOut[]>(ENDPOINTS.UNLOADING.BY_TRIP(tripId));
    return response.data;
  },

  async getById(id: number): Promise<MaterialUnloadingOut> {
    const response = await apiClient.get<MaterialUnloadingOut>(ENDPOINTS.UNLOADING.BY_ID(id));
    return response.data;
  },

  async create(data: MaterialUnloadingCreate): Promise<MaterialUnloadingOut> {
    const response = await apiClient.post<MaterialUnloadingOut>(ENDPOINTS.UNLOADING.LIST, data);
    return response.data;
  },

  async update(id: number, data: MaterialUnloadingCreate): Promise<MaterialUnloadingOut> {
    const response = await apiClient.put<MaterialUnloadingOut>(ENDPOINTS.UNLOADING.BY_ID(id), data);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(ENDPOINTS.UNLOADING.BY_ID(id));
  },
};
