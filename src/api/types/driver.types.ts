import { ApprovalStatus } from './common.types';

export interface Driver {
  id: number;
  driver_name: string;
  mobile_number: string;
  aadhaar?: string;
  approval_status: ApprovalStatus;
  approver_id?: number | null;
  created_at?: string;
}

export interface DriverCreate {
  driver_name: string;
  mobile_number: string;
  aadhaar: string;
}

export type DriverOut = Driver;

export type { ApprovalStatus };