import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { staffService } from '@/api/services/staffService';
import { authService } from '@/api/services/authService';
import { Staff, StaffCreate, StaffUpdate } from '@/api/types/auth.types';
import { UserRole, Department } from '@/api/types/common.types';
import { useToast } from '@/hooks/use-toast';

interface StaffFilters {
  department?: Department;
  role?: UserRole;
  search?: string;
}

export function useStaff(filters?: StaffFilters) {
  return useQuery({
    queryKey: ['staff', filters],
    queryFn: () => staffService.getAll({
      department: filters?.department,
      role: filters?.role,
    }),
    select: (data) => {
      if (!filters?.search) return data;
      const searchLower = filters.search.toLowerCase();
      return data.filter(staff =>
        staff.username.toLowerCase().includes(searchLower) ||
        staff.email.toLowerCase().includes(searchLower) ||
        staff.full_name?.toLowerCase().includes(searchLower)
      );
    },
  });
}

export function useStaffById(id: number | null) {
  return useQuery({
    queryKey: ['staff', id],
    queryFn: () => staffService.getById(id!),
    enabled: !!id,
  });
}

export function useCreateStaff() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: StaffCreate) => authService.register(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      toast({
        title: 'Staff Created',
        description: 'New staff member has been added successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error?.response?.data?.detail || 'Failed to create staff member.',
        variant: 'destructive',
      });
    },
  });
}

export function useUpdateStaff() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: StaffUpdate }) =>
      staffService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      toast({
        title: 'Staff Updated',
        description: 'Staff member has been updated successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error?.response?.data?.detail || 'Failed to update staff member.',
        variant: 'destructive',
      });
    },
  });
}

export function useDeleteStaff() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: number) => staffService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      toast({
        title: 'Staff Deleted',
        description: 'Staff member has been removed successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error?.response?.data?.detail || 'Failed to delete staff member.',
        variant: 'destructive',
      });
    },
  });
}
