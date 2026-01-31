import apiClient from '../config/axiosConfig';
import { ENDPOINTS } from '../config/endpoints';
import { Vehicle, VehicleCreate, VehicleOut } from '../types/vehicle.types';

export const vehicleService = {
  async getAll(): Promise<VehicleOut[]> {
    const response = await apiClient.get<VehicleOut[]>(ENDPOINTS.VEHICLES.LIST);
    return response.data;
  },

  async getByRegistration(registrationNumber: string): Promise<VehicleOut> {
  const response = await apiClient.get<VehicleOut>(
    ENDPOINTS.VEHICLES.BY_REGISTRATION(encodeURIComponent(registrationNumber))
  );
  return response.data;
  },


  async getPendingVerification(): Promise<VehicleOut[]> {
    const response = await apiClient.get<VehicleOut[]>(ENDPOINTS.VEHICLES.VERIFICATION);
    return response.data;
  },

  async getRecent(limit: number = 10): Promise<VehicleOut[]> {
    const response = await apiClient.get<VehicleOut[]>(ENDPOINTS.VEHICLES.RECENT, { params: { limit } });
    return response.data;
  },

  async create(data: VehicleCreate): Promise<VehicleOut> {
    const response = await apiClient.post<VehicleOut>(ENDPOINTS.VEHICLES.LIST, data);
    return response.data;
  },

  async approve(id: number): Promise<VehicleOut> {
    const response = await apiClient.post<VehicleOut>(ENDPOINTS.VEHICLES.APPROVE(id));
    return response.data;
  },

  async reject(id: number): Promise<VehicleOut> {
    const response = await apiClient.post<VehicleOut>(ENDPOINTS.VEHICLES.REJECT(id));
    return response.data;
  },
};
