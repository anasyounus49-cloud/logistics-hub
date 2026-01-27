import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { weightService } from '@/api/services/weightService';
import { tripService } from '@/api/services/tripService';
import { WeightCreate, WeightOut } from '@/api/types/trip.types';
import { useToast } from '@/hooks/use-toast';

// Enriched weight with trip details
export interface EnrichedWeight extends WeightOut {
  trip_vehicle_id?: number;
  trip_driver_id?: number;
  trip_po_id?: number;
  trip_status?: string;
}

export function useWeights() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch all weights
  const weightsQuery = useQuery({
    queryKey: ['weights'],
    queryFn: () => weightService.getAll(),
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

  // Enrich weights with trip data
  const allTrips = [...(tripsQuery.data || []), ...(completedTripsQuery.data || [])];
  
  const enrichedWeights: EnrichedWeight[] = (weightsQuery.data || []).map(weight => {
    const trip = allTrips.find(t => t.id === weight.trip_id);
    return {
      ...weight,
      trip_vehicle_id: trip?.vehicle_id,
      trip_driver_id: trip?.driver_id,
      trip_po_id: trip?.po_id,
      trip_status: trip?.status,
    };
  });

  // Create weight mutation
  const createWeight = useMutation({
    mutationFn: (data: WeightCreate) => weightService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weights'] });
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      toast({
        title: 'Success',
        description: 'Weight record created successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create weight record',
        variant: 'destructive',
      });
    },
  });

  // Update weight mutation
  const updateWeight = useMutation({
    mutationFn: ({ id, data }: { id: number; data: WeightCreate }) => 
      weightService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weights'] });
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      toast({
        title: 'Success',
        description: 'Weight record updated successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update weight record',
        variant: 'destructive',
      });
    },
  });

  // Delete weight mutation
  const deleteWeight = useMutation({
    mutationFn: (id: number) => weightService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weights'] });
      toast({
        title: 'Success',
        description: 'Weight record deleted successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete weight record',
        variant: 'destructive',
      });
    },
  });

  return {
    weights: enrichedWeights,
    rawWeights: weightsQuery.data || [],
    isLoading: weightsQuery.isLoading || tripsQuery.isLoading,
    isError: weightsQuery.isError,
    error: weightsQuery.error,
    createWeight,
    updateWeight,
    deleteWeight,
    refetch: () => {
      weightsQuery.refetch();
      tripsQuery.refetch();
      completedTripsQuery.refetch();
    },
  };
}

// Hook for weights by specific trip
export function useWeightsByTrip(tripId: number | null) {
  return useQuery({
    queryKey: ['weights', 'trip', tripId],
    queryFn: () => tripId ? weightService.getByTrip(tripId) : Promise.resolve([]),
    enabled: !!tripId,
  });
}

// Hook for getting gross weight of a trip
export function useGrossWeight(tripId: number | null) {
  return useQuery({
    queryKey: ['weights', 'gross', tripId],
    queryFn: () => tripId ? weightService.getGross(tripId) : Promise.resolve(null),
    enabled: !!tripId,
  });
}

// Hook for getting tare weight of a trip
export function useTareWeight(tripId: number | null) {
  return useQuery({
    queryKey: ['weights', 'tare', tripId],
    queryFn: () => tripId ? weightService.getTare(tripId) : Promise.resolve(null),
    enabled: !!tripId,
  });
}

// Hook for active trips that need weight capture
export function useTripsForWeightCapture() {
  const tripsQuery = useQuery({
    queryKey: ['trips', 'active'],
    queryFn: () => tripService.getActive(),
  });

  // Filter trips that are at weight capture stages
  const tripsNeedingWeight = (tripsQuery.data || []).filter(
    trip => trip.current_stage === 'GROSS_WEIGHT' || trip.current_stage === 'TARE_WEIGHT'
  );

  return {
    trips: tripsNeedingWeight,
    allActiveTrips: tripsQuery.data || [],
    isLoading: tripsQuery.isLoading,
    refetch: tripsQuery.refetch,
  };
}
