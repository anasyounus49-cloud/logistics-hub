import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { materialService } from '../api/services/materialService';
import { MaterialCreate } from '../api/types/material.types';
import { PaginationParams } from '../api/types/common.types';

export const MATERIALS_QUERY_KEY = 'materials';

export const useMaterials = (params?: PaginationParams & { search?: string }) => {
  return useQuery({
    queryKey: [MATERIALS_QUERY_KEY, params],
    queryFn: () => materialService.getAll(params),
  });
};

export const useMaterial = (id: number) => {
  return useQuery({
    queryKey: [MATERIALS_QUERY_KEY, id],
    queryFn: () => materialService.getById(id),
    enabled: !!id,
  });
};

export const useCreateMaterial = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: MaterialCreate) => materialService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [MATERIALS_QUERY_KEY] });
    },
  });
};

export const useUpdateMaterial = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: MaterialCreate }) =>
      materialService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [MATERIALS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [MATERIALS_QUERY_KEY, variables.id] });
    },
  });
};

export const useDeleteMaterial = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => materialService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [MATERIALS_QUERY_KEY] });
    },
  });
};