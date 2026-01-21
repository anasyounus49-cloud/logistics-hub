import { TripStatus, TripStage, WeightType, WeightStatus } from './common.types';

export interface Trip {
  id: number;
  vehicle_id: number;
  driver_id: number;
  po_id: number;
  status: TripStatus;
  current_stage: TripStage;
  gross_weight: number | null;
  tare_weight: number | null;
  created_at: string;
  completed_at: string | null;
}

export interface TripCreate {
  vehicle_id: number;
  driver_id: number;
  po_id: number;
}

export interface StageTransaction {
  id: number;
  trip_id: number;
  stage_name: string;
  stage_status: string;
  staff_id: number;
  role: string;
  action_timestamp: string;
  remarks: string | null;
}

export interface StageUpdate {
  next_stage: TripStage;
  remarks?: string | null;
}

export interface Weight {
  id: number;
  trip_id: number;
  weight_type: WeightType;
  weight_value: number;
  capture_time: string;
  camera_image_refs: string | null;
  operator_id: number;
  status: WeightStatus;
}

export interface WeightCreate {
  trip_id: number;
  weight_type: WeightType;
  weight_value: number;
  camera_image_refs?: string | null;
  status: WeightStatus;
}

export interface MaterialUnloading {
  id: number;
  trip_id: number;
  material_type: string;
  accepted_qty: number;
  rejection_qty: number;
  staff_id: number;
  verification_time: string;
  remarks: string | null;
}

export interface MaterialUnloadingCreate {
  trip_id: number;
  material_type: string;
  accepted_qty: number;
  rejection_qty?: number;
  remarks?: string | null;
}

export type TripOut = Trip;
export type StageTransactionOut = StageTransaction;
export type WeightOut = Weight;
export type MaterialUnloadingOut = MaterialUnloading;
