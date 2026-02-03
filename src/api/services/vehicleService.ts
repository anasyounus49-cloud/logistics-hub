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

  // UPDATED: Now accepts both FormData (for file upload) and VehicleCreate (for JSON)
  async create(data: FormData | VehicleCreate): Promise<VehicleOut> {
    console.log('=== vehicleService.create called ===');
    console.log('Data type:', data instanceof FormData ? 'FormData' : 'Object');
    
    // Check if data is FormData (for file upload with new backend)
    if (data instanceof FormData) {
      // Log FormData contents for debugging
      console.log('Sending FormData with the following fields:');
      for (const [key, value] of data.entries()) {
        console.log(`  ${key}:`, value instanceof File ? `File(${value.name}, ${value.size} bytes)` : value);
      }
      
      console.log('Making POST request to:', ENDPOINTS.VEHICLES.LIST);
      
      try {
        // Explicitly set Content-Type header for FormData
        const response = await apiClient.post<VehicleOut>(ENDPOINTS.VEHICLES.LIST, data, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        console.log('Response received:', response.data);
        return response.data;
      } catch (error: any) {
        console.error('POST request failed:', error);
        console.error('Error config:', error.config);
        console.error('Error response:', error.response);
        throw error;
      }
    } else {
      // Legacy JSON support (if needed)
      console.log('Sending JSON data:', data);
      const response = await apiClient.post<VehicleOut>(ENDPOINTS.VEHICLES.LIST, data);
      return response.data;
    }
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