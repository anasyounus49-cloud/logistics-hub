// API Endpoint Configuration

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

export const ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    REGISTER: '/api/auth/register',
  },

  // Staff
  STAFF: {
    ME: '/api/staff/me',
    LIST: '/api/staff/',
    BY_DEPARTMENT: (dept: string) => `/api/staff/by-department/${dept}`,
    BY_ROLE: (role: string) => `/api/staff/by-role/${role}`,
    BY_ID: (id: number) => `/api/staff/${id}`,
  },

  // Drivers
  DRIVERS: {
    LIST: '/api/drivers/',
    PENDING: '/api/drivers/pending',
    APPROVED: '/api/drivers/approved',
    BY_ID: (id: number) => `/api/drivers/${id}`,
    APPROVE: (id: number) => `/api/drivers/${id}/approve`,
    REJECT: (id: number) => `/api/drivers/${id}/reject`,
  },

  // Vehicles
  VEHICLES: {
    LIST: '/api/vehicles/',
    VERIFICATION: '/api/vehicles/verification',
    RECENT: '/api/vehicles/security/recent',
    BY_REGISTRATION: (reg: string) => `/api/vehicles/${reg}`,
    APPROVE: (id: number) => `/api/vehicles/${id}/approve`,
    REJECT: (id: number) => `/api/vehicles/${id}/reject`,
  },

  // Purchase Orders
  PURCHASE_ORDERS: {
    LIST: '/api/purchase-orders/',
    ACTIVE: '/api/purchase-orders/active',
    EXPIRED: '/api/purchase-orders/expired',
    CLOSED: '/api/purchase-orders/closed',
    BY_REF: (ref: string) => `/api/purchase-orders/reference/${ref}`,
    BY_ID: (id: number) => `/api/purchase-orders/${id}`,
    UPDATE_MATERIAL: (poId: number, matId: number) => 
      `/api/purchase-orders/${poId}/materials/${matId}/receive`,
  },

  // Materials
  MATERIALS: {
    LIST: '/api/materials/',
    BY_ID: (id: number) => `/api/materials/${id}`,
  },

  // Trips
  TRIPS: {
    LIST: '/api/trips/',
    ACTIVE: '/api/trips/active',
    COMPLETED: '/api/trips/completed',
    CURRENT: '/api/trips/current',
    BY_ID: (id: number) => `/api/trips/${id}`,
  },

  // Stage Transactions
  STAGES: {
    BY_TRIP: (tripId: number) => `/api/stage-transactions/trip/${tripId}`,
    ADVANCE: (tripId: number) => `/api/stage-transactions/trip/${tripId}/advance`,
  },

  // Weights
  WEIGHTS: {
    LIST: '/api/weights/',
    BY_TRIP: (tripId: number) => `/api/weights/trip/${tripId}`,
    GROSS: (tripId: number) => `/api/weights/trip/${tripId}/gross`,
    TARE: (tripId: number) => `/api/weights/trip/${tripId}/tare`,
    BY_ID: (id: number) => `/api/weights/${id}`,
  },

  // Material Unloading
  UNLOADING: {
    LIST: '/api/material-unloadings/',
    WITH_REJECTIONS: '/api/material-unloadings/with-rejections',
    BY_TRIP: (tripId: number) => `/api/material-unloadings/trip/${tripId}`,
    BY_ID: (id: number) => `/api/material-unloadings/${id}`,
  },
} as const;
