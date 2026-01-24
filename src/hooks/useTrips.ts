import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tripService } from '@/api/services/tripService';
import { driverService } from '@/api/services/driverService';
import { vehicleService } from '@/api/services/vehicleService';
import { purchaseOrderService } from '@/api/services/purchaseOrderService';
import { TripCreate, StageUpdate, TripOut, StageTransactionOut } from '@/api/types/trip.types';
import { TripStatus } from '@/api/types/common.types';
import { useToast } from '@/hooks/use-toast';

// Enriched trip type with related data
export interface EnrichedTrip extends TripOut {
  vehicle_registration?: string;
  vehicle_type?: string;
  driver_name?: string;
  driver_mobile?: string;
  po_reference?: string;
  seller_name?: string;
}

export function useActiveTrips() {
  return useQuery({
    queryKey: ['trips', 'active'],
    queryFn: () => tripService.getActive(),
  });
}

export function useCompletedTrips() {
  return useQuery({
    queryKey: ['trips', 'completed'],
    queryFn: () => tripService.getCompleted(),
  });
}

// Hook to get all related data for enriching trips
export function useTripsRelatedData() {
  const drivers = useQuery({
    queryKey: ['drivers', 'all'],
    queryFn: () => driverService.getAll(),
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
  });

  const vehicles = useQuery({
    queryKey: ['vehicles', 'all'],
    queryFn: () => vehicleService.getAll(),
    staleTime: 10 * 60 * 1000,
  });

  const purchaseOrders = useQuery({
    queryKey: ['purchase-orders', 'all'],
    queryFn: () => purchaseOrderService.getAll(),
    staleTime: 10 * 60 * 1000,
  });

  return {
    drivers: drivers.data ?? [],
    vehicles: vehicles.data ?? [],
    purchaseOrders: purchaseOrders.data ?? [],
    isLoading: drivers.isLoading || vehicles.isLoading || purchaseOrders.isLoading,
  };
}

export function useTrips(status?: TripStatus) {
  const activeQuery = useActiveTrips();
  const completedQuery = useCompletedTrips();
  const { drivers, vehicles, purchaseOrders, isLoading: loadingRelated } = useTripsRelatedData();

  const isLoading = activeQuery.isLoading || completedQuery.isLoading || loadingRelated;
  const error = activeQuery.error || completedQuery.error;

  const trips: EnrichedTrip[] = (() => {
    const active = activeQuery.data ?? [];
    const completed = completedQuery.data ?? [];

    let baseTrips: TripOut[];
    if (status === 'ACTIVE') baseTrips = active;
    else if (status === 'COMPLETED') baseTrips = completed;
    else baseTrips = [...active, ...completed];

    // Enrich trips with related data
    return baseTrips.map((trip) => {
      const vehicle = vehicles.find((v) => v.id === trip.vehicle_id);
      const driver = drivers.find((d) => d.id === trip.driver_id);
      const po = purchaseOrders.find((p) => p.id === trip.po_id);

      return {
        ...trip,
        vehicle_registration: vehicle?.registration_number,
        vehicle_type: vehicle?.vehicle_type,
        driver_name: driver?.driver_name,
        driver_mobile: driver?.mobile_number,
        po_reference: po?.po_reference_number,
        seller_name: po?.seller_name,
      };
    });
  })();

  return {
    data: trips,
    isLoading,
    error,
    refetch: () => {
      activeQuery.refetch();
      completedQuery.refetch();
    },
  };
}

export function useTripById(id: number | null) {
  return useQuery({
    queryKey: ['trips', id],
    queryFn: () => tripService.getById(id!),
    enabled: id !== null,
  });
}

export function useTripStages(tripId: number | null) {
  return useQuery({
    queryKey: ['trips', tripId, 'stages'],
    queryFn: () => tripService.getStages(tripId!),
    enabled: tripId !== null,
  });
}

export function useCreateTrip() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: TripCreate) => tripService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      toast({
        title: 'Trip Created',
        description: 'New trip has been started successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Failed to create trip.',
        variant: 'destructive',
      });
    },
  });
}

export function useAdvanceStage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ tripId, data }: { tripId: number; data: StageUpdate }) =>
      tripService.advanceStage(tripId, data),
    onSuccess: (_, { tripId }) => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      queryClient.invalidateQueries({ queryKey: ['trips', tripId] });
      queryClient.invalidateQueries({ queryKey: ['trips', tripId, 'stages'] });
      toast({
        title: 'Stage Advanced',
        description: 'Trip has moved to the next stage.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Failed to advance stage.',
        variant: 'destructive',
      });
    },
  });
}
