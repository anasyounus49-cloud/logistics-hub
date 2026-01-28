import { ApprovalStatus } from './common.types';

export interface Driver {
  id: number;
  driver_name: string;
  mobile_number: string;
  aadhaar_encrypted?: string;
  approval_status: ApprovalStatus;
}

export interface DriverCreate {
  driver_name: string;
  mobile_number: string;
  aadhaar_encrypted: string;
}

export type DriverOut = Driver;
