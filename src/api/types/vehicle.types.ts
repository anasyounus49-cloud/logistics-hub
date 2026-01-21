import { ApprovalStatus } from './common.types';

export interface Vehicle {
  id: number;
  registration_number: string;
  vehicle_type: string;
  manufacturer_tare_weight: number;
  approval_status: ApprovalStatus;
  approver_id: number | null;
  created_at: string;
}

export interface VehicleCreate {
  registration_number: string;
  vehicle_type: string;
  manufacturer_tare_weight: number;
}

export type VehicleOut = Vehicle;
