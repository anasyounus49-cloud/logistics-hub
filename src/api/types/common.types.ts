// Common API types

export interface PaginationParams {
  skip?: number;
  limit?: number;
}

export interface ApiError {
  detail: string;
  status_code?: number;
}

export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export type TripStatus = 'ACTIVE' | 'COMPLETED' | 'FAILED';

export type TripStage = 'ENTRY_GATE' | 'GROSS_WEIGHT' | 'UNLOADING' | 'TARE_WEIGHT' | 'EXIT_GATE';

export type WeightType = 'Gross' | 'Tare';

export type WeightStatus = 'PASSED' | 'FAILED';

export type POStatus = 'Active' | 'Closed' | 'Expired';

export type UserRole = 'super admin' | 'admin' | 'security' | 'operator' | 'user';

export type Department = 'HR' | 'purchase' | 'finance';
