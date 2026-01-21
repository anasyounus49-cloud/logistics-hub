import { POStatus } from './common.types';

export interface POMaterial {
  material_id: number;
  needed_qty: number;
  received_qty?: number;
}

export interface PurchaseOrder {
  id: number;
  po_reference_number: string;
  seller_name: string;
  seller_mobile?: string;
  seller_aadhaar?: string;
  validity_start_date?: string;
  validity_end_date?: string;
  units?: string;
  status: POStatus;
  materials: POMaterial[];
}

export interface POCreate {
  po_reference_number: string;
  seller_name: string;
  seller_mobile: string;
  seller_aadhaar: string;
  validity_start_date: string;
  validity_end_date: string;
  units: string;
  materials: {
    material_id: number;
    needed_qty: number;
  }[];
}

export type POOut = PurchaseOrder;
