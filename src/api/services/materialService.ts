import apiClient from '../config/axiosConfig';
import { ENDPOINTS } from '../config/endpoints';
import { Material, MaterialCreate, MaterialOut } from '../types/material.types';
import { PaginationParams } from '../types/common.types';

export const materialService = {
  async getAll(params?: PaginationParams & { search?: string }): Promise<MaterialOut[]> {
    const response = await apiClient.get<MaterialOut[]>(ENDPOINTS.MATERIALS.LIST, { params });
    return response.data;
  },

  async getById(id: number): Promise<MaterialOut> {
    const response = await apiClient.get<MaterialOut>(ENDPOINTS.MATERIALS.BY_ID(id));
    return response.data;
  },

  async create(data: MaterialCreate): Promise<MaterialOut> {
    const response = await apiClient.post<MaterialOut>(ENDPOINTS.MATERIALS.LIST, data);
    return response.data;
  },

  async update(id: number, data: MaterialCreate): Promise<MaterialOut> {
    const response = await apiClient.put<MaterialOut>(ENDPOINTS.MATERIALS.BY_ID(id), data);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(ENDPOINTS.MATERIALS.BY_ID(id));
  },
};
