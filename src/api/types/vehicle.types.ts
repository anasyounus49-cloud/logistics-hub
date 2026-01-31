import { ApprovalStatus } from './common.types';

export interface Vehicle {
  id: number;
  registration_number: string;
  vehicle_type: string;
  manufacturer_tare_weight: number;
  fastag_id?: string | null;
  vehicle_image?: string | null; // base64 or URL
  approval_status: ApprovalStatus;
  approver_id: number | null;
  created_at: string;
}

export interface VehicleCreate {
  registration_number: string;
  vehicle_type: string;
  manufacturer_tare_weight: number;
  fastag_id?: string;
  vehicle_image?: string; // base64 encoded image
}

export type VehicleOut = Vehicle;