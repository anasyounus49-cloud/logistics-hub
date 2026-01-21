import apiClient from '../config/axiosConfig';
import { ENDPOINTS } from '../config/endpoints';
import { 
  Trip, 
  TripCreate, 
  TripOut, 
  StageTransaction, 
  StageTransactionOut,
  StageUpdate 
} from '../types/trip.types';

export const tripService = {
  async getActive(): Promise<TripOut[]> {
    const response = await apiClient.get<TripOut[]>(ENDPOINTS.TRIPS.ACTIVE);
    return response.data;
  },

  async getCompleted(): Promise<TripOut[]> {
    const response = await apiClient.get<TripOut[]>(ENDPOINTS.TRIPS.COMPLETED);
    return response.data;
  },

  async getCurrent(params?: { vehicle_id?: number; driver_id?: number }): Promise<TripOut> {
    const response = await apiClient.get<TripOut>(ENDPOINTS.TRIPS.CURRENT, { params });
    return response.data;
  },

  async getById(id: number): Promise<TripOut> {
    const response = await apiClient.get<TripOut>(ENDPOINTS.TRIPS.BY_ID(id));
    return response.data;
  },

  async create(data: TripCreate): Promise<TripOut> {
    const response = await apiClient.post<TripOut>(ENDPOINTS.TRIPS.LIST, data);
    return response.data;
  },

  // Stage transactions
  async getStages(tripId: number): Promise<StageTransactionOut[]> {
    const response = await apiClient.get<StageTransactionOut[]>(ENDPOINTS.STAGES.BY_TRIP(tripId));
    return response.data;
  },

  async advanceStage(tripId: number, data: StageUpdate): Promise<StageTransactionOut> {
    const response = await apiClient.post<StageTransactionOut>(ENDPOINTS.STAGES.ADVANCE(tripId), data);
    return response.data;
  },
};
