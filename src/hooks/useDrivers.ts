import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { driverService } from '@/api/services/driverService';
import { DriverCreate, DriverOut } from '@/api/types/driver.types';
import { ApprovalStatus } from '@/api/types/common.types';
import { useToast } from '@/hooks/use-toast';

export function useDrivers(params?: { approval_status?: ApprovalStatus; search?: string }) {
  return useQuery({
    queryKey: ['drivers', params],
    queryFn: () => driverService.getAll(params),
  });
}

export function usePendingDrivers() {
  return useQuery({
    queryKey: ['drivers', 'pending'],
    queryFn: () => driverService.getPending(),
  });
}

export function useApprovedDrivers() {
  return useQuery({
    queryKey: ['drivers', 'approved'],
    queryFn: () => driverService.getApproved(),
  });
}

export function useDriver(id: number) {
  return useQuery({
    queryKey: ['drivers', id],
    queryFn: () => driverService.getById(id),
    enabled: !!id,
  });
}

export function useCreateDriver() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: DriverCreate) => driverService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      toast({
        title: 'Driver Created',
        description: 'New driver has been registered successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Failed to create driver',
        variant: 'destructive',
      });
    },
  });
}

export function useUpdateDriver() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: DriverCreate }) =>
      driverService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      toast({
        title: 'Driver Updated',
        description: 'Driver information has been updated.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Failed to update driver',
        variant: 'destructive',
      });
    },
  });
}

export function useDeleteDriver() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: number) => driverService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      toast({
        title: 'Driver Deleted',
        description: 'Driver has been removed from the system.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Failed to delete driver',
        variant: 'destructive',
      });
    },
  });
}

export function useApproveDriver() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: number) => driverService.approve(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      toast({
        title: 'Driver Approved',
        description: 'Driver has been approved and can now be assigned to trips.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Failed to approve driver',
        variant: 'destructive',
      });
    },
  });
}

export function useRejectDriver() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: number) => driverService.reject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      toast({
        title: 'Driver Rejected',
        description: 'Driver registration has been rejected.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Failed to reject driver',
        variant: 'destructive',
      });
    },
  });
}
