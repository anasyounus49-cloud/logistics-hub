import apiClient from '../config/axiosConfig';
import { ENDPOINTS } from '../config/endpoints';
import { Driver, DriverCreate, DriverOut } from '../types/driver.types';
import { PaginationParams, ApprovalStatus } from '../types/common.types';

export const driverService = {
  async getAll(params?: PaginationParams & { approval_status?: ApprovalStatus; search?: string }): Promise<DriverOut[]> {
    const response = await apiClient.get<DriverOut[]>(ENDPOINTS.DRIVERS.LIST, { params });
    return response.data;
  },

  async getPending(): Promise<DriverOut[]> {
    const response = await apiClient.get<DriverOut[]>(ENDPOINTS.DRIVERS.PENDING);
    return response.data;
  },

  async getApproved(): Promise<DriverOut[]> {
    const response = await apiClient.get<DriverOut[]>(ENDPOINTS.DRIVERS.APPROVED);
    return response.data;
  },

  async getById(id: number): Promise<DriverOut> {
    const response = await apiClient.get<DriverOut>(ENDPOINTS.DRIVERS.BY_ID(id));
    return response.data;
  },

  async create(data: DriverCreate): Promise<DriverOut> {
    const response = await apiClient.post<DriverOut>(ENDPOINTS.DRIVERS.LIST, data);
    return response.data;
  },

  async update(id: number, data: DriverCreate): Promise<DriverOut> {
    const response = await apiClient.put<DriverOut>(ENDPOINTS.DRIVERS.BY_ID(id), data);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(ENDPOINTS.DRIVERS.BY_ID(id));
  },

  async approve(id: number): Promise<DriverOut> {
    const response = await apiClient.patch<DriverOut>(ENDPOINTS.DRIVERS.APPROVE(id));
    return response.data;
  },

  async reject(id: number): Promise<DriverOut> {
    const response = await apiClient.patch<DriverOut>(ENDPOINTS.DRIVERS.REJECT(id));
    return response.data;
  },
};
