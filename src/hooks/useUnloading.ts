import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { unloadingService } from '@/api/services/unloadingService';
import { tripService } from '@/api/services/tripService';
import { materialService } from '@/api/services/materialService';
import { MaterialUnloadingCreate, MaterialUnloadingOut } from '@/api/types/trip.types';
import { useToast } from '@/hooks/use-toast';

// Enriched unloading with trip and material details
export interface EnrichedUnloading extends MaterialUnloadingOut {
  trip_vehicle_id?: number;
  trip_driver_id?: number;
  trip_po_id?: number;
  trip_status?: string;
  net_qty?: number;
  rejection_rate?: number;
}

export function useUnloading() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch all unloadings
  const unloadingsQuery = useQuery({
    queryKey: ['unloadings'],
    queryFn: () => unloadingService.getAll(),
  });

  // Fetch with rejections
  const rejectionsQuery = useQuery({
    queryKey: ['unloadings', 'with-rejections'],
    queryFn: () => unloadingService.getWithRejections(),
  });

  // Fetch active trips for enrichment
  const tripsQuery = useQuery({
    queryKey: ['trips', 'active'],
    queryFn: () => tripService.getActive(),
  });

  const completedTripsQuery = useQuery({
    queryKey: ['trips', 'completed'],
    queryFn: () => tripService.getCompleted(),
  });

  // Enrich unloadings with trip data
  const allTrips = [...(tripsQuery.data || []), ...(completedTripsQuery.data || [])];
  
  const enrichedUnloadings: EnrichedUnloading[] = (unloadingsQuery.data || []).map(unloading => {
    const trip = allTrips.find(t => t.id === unloading.trip_id);
    const totalQty = unloading.accepted_qty + unloading.rejection_qty;
    return {
      ...unloading,
      trip_vehicle_id: trip?.vehicle_id,
      trip_driver_id: trip?.driver_id,
      trip_po_id: trip?.po_id,
      trip_status: trip?.status,
      net_qty: unloading.accepted_qty,
      rejection_rate: totalQty > 0 ? (unloading.rejection_qty / totalQty) * 100 : 0,
    };
  });

  // Create unloading mutation
  const createUnloading = useMutation({
    mutationFn: (data: MaterialUnloadingCreate) => unloadingService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unloadings'] });
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      toast({
        title: 'Success',
        description: 'Unloading record created successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create unloading record',
        variant: 'destructive',
      });
    },
  });

  // Update unloading mutation
  const updateUnloading = useMutation({
    mutationFn: ({ id, data }: { id: number; data: MaterialUnloadingCreate }) => 
      unloadingService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unloadings'] });
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      toast({
        title: 'Success',
        description: 'Unloading record updated successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update unloading record',
        variant: 'destructive',
      });
    },
  });

  // Delete unloading mutation
  const deleteUnloading = useMutation({
    mutationFn: (id: number) => unloadingService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unloadings'] });
      toast({
        title: 'Success',
        description: 'Unloading record deleted successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete unloading record',
        variant: 'destructive',
      });
    },
  });

  return {
    unloadings: enrichedUnloadings,
    rawUnloadings: unloadingsQuery.data || [],
    withRejections: rejectionsQuery.data || [],
    isLoading: unloadingsQuery.isLoading || tripsQuery.isLoading,
    isError: unloadingsQuery.isError,
    error: unloadingsQuery.error,
    createUnloading,
    updateUnloading,
    deleteUnloading,
    refetch: () => {
      unloadingsQuery.refetch();
      rejectionsQuery.refetch();
      tripsQuery.refetch();
      completedTripsQuery.refetch();
    },
  };
}

// Hook for unloadings by specific trip
export function useUnloadingByTrip(tripId: number | null) {
  return useQuery({
    queryKey: ['unloadings', 'trip', tripId],
    queryFn: () => tripId ? unloadingService.getByTrip(tripId) : Promise.resolve([]),
    enabled: !!tripId,
  });
}

// Hook for trips at unloading stage
export function useTripsForUnloading() {
  const tripsQuery = useQuery({
    queryKey: ['trips', 'active'],
    queryFn: () => tripService.getActive(),
  });

  // Filter trips that are at unloading stage
  const tripsAtUnloading = (tripsQuery.data || []).filter(
    trip => trip.current_stage === 'UNLOADING'
  );

  return {
    trips: tripsAtUnloading,
    allActiveTrips: tripsQuery.data || [],
    isLoading: tripsQuery.isLoading,
    refetch: tripsQuery.refetch,
  };
}

// Hook for materials list
export function useMaterialsList() {
  return useQuery({
    queryKey: ['materials'],
    queryFn: () => materialService.getAll(),
  });
}
