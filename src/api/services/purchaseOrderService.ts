import apiClient from '../config/axiosConfig';
import { ENDPOINTS } from '../config/endpoints';
import { PurchaseOrder, POCreate, POOut } from '../types/purchaseOrder.types';
import { PaginationParams, POStatus } from '../types/common.types';

export const purchaseOrderService = {
  async getAll(params?: PaginationParams & { status?: POStatus }): Promise<POOut[]> {
    const response = await apiClient.get<POOut[]>(ENDPOINTS.PURCHASE_ORDERS.LIST, { params });
    return response.data;
  },

  async getActive(): Promise<POOut[]> {
    const response = await apiClient.get<POOut[]>(ENDPOINTS.PURCHASE_ORDERS.ACTIVE);
    return response.data;
  },

  async getExpired(): Promise<POOut[]> {
    const response = await apiClient.get<POOut[]>(ENDPOINTS.PURCHASE_ORDERS.EXPIRED);
    return response.data;
  },

  async getClosed(): Promise<POOut[]> {
    const response = await apiClient.get<POOut[]>(ENDPOINTS.PURCHASE_ORDERS.CLOSED);
    return response.data;
  },

  async getByReference(referenceNumber: string): Promise<POOut> {
    const response = await apiClient.get<POOut>(ENDPOINTS.PURCHASE_ORDERS.BY_REF(referenceNumber));
    return response.data;
  },

  async getById(id: number): Promise<POOut> {
    const response = await apiClient.get<POOut>(ENDPOINTS.PURCHASE_ORDERS.BY_ID(id));
    return response.data;
  },

  async create(data: POCreate): Promise<POOut> {
    const response = await apiClient.post<POOut>(ENDPOINTS.PURCHASE_ORDERS.LIST, data);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(ENDPOINTS.PURCHASE_ORDERS.BY_ID(id));
  },

  async updateMaterialReceived(poId: number, materialId: number, receivedQty: number): Promise<POOut> {
    const response = await apiClient.patch<POOut>(
      ENDPOINTS.PURCHASE_ORDERS.UPDATE_MATERIAL(poId, materialId),
      null,
      { params: { received_qty: receivedQty } }
    );
    return response.data;
  },
};
