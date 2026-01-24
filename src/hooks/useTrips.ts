import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tripService } from '@/api/services/tripService';
import { TripCreate, StageUpdate, TripOut, StageTransactionOut } from '@/api/types/trip.types';
import { TripStatus } from '@/api/types/common.types';
import { useToast } from '@/hooks/use-toast';

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

export function useTrips(status?: TripStatus) {
  const activeQuery = useActiveTrips();
  const completedQuery = useCompletedTrips();

  const isLoading = activeQuery.isLoading || completedQuery.isLoading;
  const error = activeQuery.error || completedQuery.error;

  const trips = (() => {
    const active = activeQuery.data ?? [];
    const completed = completedQuery.data ?? [];

    if (status === 'ACTIVE') return active;
    if (status === 'COMPLETED') return completed;
    return [...active, ...completed];
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
