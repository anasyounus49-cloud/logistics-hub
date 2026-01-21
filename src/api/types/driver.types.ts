import { ApprovalStatus } from './common.types';

export interface Driver {
  id: number;
  driver_name: string;
  mobile_number: string;
  aadhaar?: string;
  approval_status: ApprovalStatus;
}

export interface DriverCreate {
  driver_name: string;
  mobile_number: string;
  aadhaar: string;
}

export type DriverOut = Driver;
