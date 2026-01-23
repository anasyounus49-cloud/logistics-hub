import { useQuery } from '@tanstack/react-query';
import { tripService } from '@/api/services/tripService';
import { weightService } from '@/api/services/weightService';
import { driverService } from '@/api/services/driverService';
import { vehicleService } from '@/api/services/vehicleService';
import { purchaseOrderService } from '@/api/services/purchaseOrderService';
import { staffService } from '@/api/services/staffService';

// Super Admin Dashboard Stats
export function useSuperAdminStats() {
  const activeTrips = useQuery({
    queryKey: ['trips', 'active'],
    queryFn: () => tripService.getActive(),
  });

  const completedTrips = useQuery({
    queryKey: ['trips', 'completed'],
    queryFn: () => tripService.getCompleted(),
  });

  const staff = useQuery({
    queryKey: ['staff'],
    queryFn: () => staffService.getAll(),
  });

  const pendingDrivers = useQuery({
    queryKey: ['drivers', 'pending'],
    queryFn: () => driverService.getPending(),
  });

  const approvedDrivers = useQuery({
    queryKey: ['drivers', 'approved'],
    queryFn: () => driverService.getApproved(),
  });

  const pendingVehicles = useQuery({
    queryKey: ['vehicles', 'verification'],
    queryFn: () => vehicleService.getPendingVerification(),
  });

  const vehicles = useQuery({
    queryKey: ['vehicles'],
    queryFn: () => vehicleService.getAll(),
  });

  const activePOs = useQuery({
    queryKey: ['purchase-orders', 'active'],
    queryFn: () => purchaseOrderService.getActive(),
  });

  const weights = useQuery({
    queryKey: ['weights'],
    queryFn: () => weightService.getAll(),
  });

  const isLoading = 
    activeTrips.isLoading || 
    staff.isLoading || 
    pendingDrivers.isLoading || 
    pendingVehicles.isLoading ||
    vehicles.isLoading ||
    activePOs.isLoading ||
    approvedDrivers.isLoading;

  // Calculate today's weight (sum of all weights captured today)
  const todayWeight = weights.data?.reduce((sum, w) => {
    const captureDate = new Date(w.capture_time).toDateString();
    const today = new Date().toDateString();
    if (captureDate === today) {
      return sum + w.weight_value;
    }
    return sum;
  }, 0) || 0;

  return {
    isLoading,
    stats: {
      activeTrips: activeTrips.data?.length || 0,
      completedTrips: completedTrips.data?.length || 0,
      totalStaff: staff.data?.length || 0,
      pendingApprovals: (pendingDrivers.data?.length || 0) + (pendingVehicles.data?.length || 0),
      pendingDrivers: pendingDrivers.data?.length || 0,
      pendingVehicles: pendingVehicles.data?.length || 0,
      approvedDrivers: approvedDrivers.data?.length || 0,
      registeredVehicles: vehicles.data?.length || 0,
      activePOs: activePOs.data?.length || 0,
      todayWeight: todayWeight / 1000, // Convert to MT
    },
    refetch: () => {
      activeTrips.refetch();
      staff.refetch();
      pendingDrivers.refetch();
      pendingVehicles.refetch();
      vehicles.refetch();
      activePOs.refetch();
      approvedDrivers.refetch();
      weights.refetch();
    },
  };
}

// Purchase Admin Dashboard Stats
export function usePurchaseAdminStats() {
  const activePOs = useQuery({
    queryKey: ['purchase-orders', 'active'],
    queryFn: () => purchaseOrderService.getActive(),
  });

  const pendingDrivers = useQuery({
    queryKey: ['drivers', 'pending'],
    queryFn: () => driverService.getPending(),
  });

  const pendingVehicles = useQuery({
    queryKey: ['vehicles', 'verification'],
    queryFn: () => vehicleService.getPendingVerification(),
  });

  const activeTrips = useQuery({
    queryKey: ['trips', 'active'],
    queryFn: () => tripService.getActive(),
  });

  const isLoading = 
    activePOs.isLoading || 
    pendingDrivers.isLoading || 
    pendingVehicles.isLoading ||
    activeTrips.isLoading;

  return {
    isLoading,
    stats: {
      activePOs: activePOs.data?.length || 0,
      pendingDrivers: pendingDrivers.data?.length || 0,
      pendingVehicles: pendingVehicles.data?.length || 0,
      activeTrips: activeTrips.data?.length || 0,
    },
    data: {
      activePOs: activePOs.data || [],
      pendingDrivers: pendingDrivers.data || [],
      pendingVehicles: pendingVehicles.data || [],
      activeTrips: activeTrips.data || [],
    },
    refetch: () => {
      activePOs.refetch();
      pendingDrivers.refetch();
      pendingVehicles.refetch();
      activeTrips.refetch();
    },
  };
}

// Security Dashboard Stats
export function useSecurityStats() {
  const activeTrips = useQuery({
    queryKey: ['trips', 'active'],
    queryFn: () => tripService.getActive(),
  });

  const completedTrips = useQuery({
    queryKey: ['trips', 'completed'],
    queryFn: () => tripService.getCompleted(),
  });

  const pendingVehicles = useQuery({
    queryKey: ['vehicles', 'verification'],
    queryFn: () => vehicleService.getPendingVerification(),
  });

  const recentVehicles = useQuery({
    queryKey: ['vehicles', 'recent'],
    queryFn: () => vehicleService.getRecent(),
  });

  const isLoading = 
    activeTrips.isLoading || 
    completedTrips.isLoading || 
    pendingVehicles.isLoading ||
    recentVehicles.isLoading;

  // Calculate today's stats
  const allTrips = [...(activeTrips.data || []), ...(completedTrips.data || [])];
  const todayTrips = allTrips.filter(trip => {
    const tripDate = new Date(trip.created_at).toDateString();
    const today = new Date().toDateString();
    return tripDate === today;
  });

  const gateEntries = todayTrips.filter(trip => 
    trip.current_stage !== 'ENTRY_GATE' || trip.status === 'ACTIVE'
  ).length;

  const gateExits = todayTrips.filter(trip => 
    trip.current_stage === 'EXIT_GATE' || trip.status === 'COMPLETED'
  ).length;

  return {
    isLoading,
    stats: {
      vehiclesToday: todayTrips.length,
      gateEntries,
      gateExits,
      pendingVerification: pendingVehicles.data?.length || 0,
    },
    data: {
      pendingVehicles: pendingVehicles.data || [],
      recentVehicles: recentVehicles.data || [],
      activeTrips: activeTrips.data || [],
    },
    refetch: () => {
      activeTrips.refetch();
      completedTrips.refetch();
      pendingVehicles.refetch();
      recentVehicles.refetch();
    },
  };
}

// Operator Dashboard Stats
export function useOperatorStats() {
  const activeTrips = useQuery({
    queryKey: ['trips', 'active'],
    queryFn: () => tripService.getActive(),
  });

  const weights = useQuery({
    queryKey: ['weights'],
    queryFn: () => weightService.getAll(),
  });

  const isLoading = activeTrips.isLoading || weights.isLoading;

  // Calculate today's stats
  const today = new Date().toDateString();
  
  const todayWeights = weights.data?.filter(w => {
    const captureDate = new Date(w.capture_time).toDateString();
    return captureDate === today;
  }) || [];

  const pendingUnloads = activeTrips.data?.filter(
    trip => trip.current_stage === 'UNLOADING' || trip.current_stage === 'GROSS_WEIGHT'
  ).length || 0;

  // Quality checks are weights that passed
  const qualityChecks = todayWeights.filter(w => w.status === 'PASSED').length;

  return {
    isLoading,
    stats: {
      activeTrips: activeTrips.data?.length || 0,
      weightsCaptured: todayWeights.length,
      qualityChecks,
      pendingUnloads,
    },
    data: {
      activeTrips: activeTrips.data || [],
      todayWeights,
    },
    refetch: () => {
      activeTrips.refetch();
      weights.refetch();
    },
  };
}
