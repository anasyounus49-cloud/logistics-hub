import apiClient from '../config/axiosConfig';
import { ENDPOINTS } from '../config/endpoints';
import { Staff, StaffUpdate } from '../types/auth.types';
import { PaginationParams, UserRole, Department } from '../types/common.types';

export const staffService = {
  async getAll(params?: PaginationParams & { department?: Department; role?: UserRole }): Promise<Staff[]> {
    const response = await apiClient.get<Staff[]>(ENDPOINTS.STAFF.LIST, { params });
    return response.data;
  },

  async getByDepartment(department: Department, params?: PaginationParams): Promise<Staff[]> {
    const response = await apiClient.get<Staff[]>(ENDPOINTS.STAFF.BY_DEPARTMENT(department), { params });
    return response.data;
  },

  async getByRole(role: UserRole, params?: PaginationParams): Promise<Staff[]> {
    const response = await apiClient.get<Staff[]>(ENDPOINTS.STAFF.BY_ROLE(role), { params });
    return response.data;
  },

  async getById(id: number): Promise<Staff> {
    const response = await apiClient.get<Staff>(ENDPOINTS.STAFF.BY_ID(id));
    return response.data;
  },

  async updateCurrent(data: StaffUpdate): Promise<Staff> {
    const response = await apiClient.put<Staff>(ENDPOINTS.STAFF.ME, data);
    return response.data;
  },

  async update(id: number, data: StaffUpdate): Promise<Staff> {
    const response = await apiClient.put<Staff>(ENDPOINTS.STAFF.BY_ID(id), data);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(ENDPOINTS.STAFF.BY_ID(id));
  },
};
