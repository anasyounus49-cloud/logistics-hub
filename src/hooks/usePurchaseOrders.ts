import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { purchaseOrderService } from '@/api/services/purchaseOrderService';
import { materialService } from '@/api/services/materialService';
import { POCreate, POOut } from '@/api/types/purchaseOrder.types';
import { POStatus } from '@/api/types/common.types';
import { useToast } from '@/hooks/use-toast';

export function usePurchaseOrders(status?: POStatus) {
  return useQuery({
    queryKey: ['purchase-orders', status],
    queryFn: () => purchaseOrderService.getAll({ status }),
  });
}

export function useActivePurchaseOrders() {
  return useQuery({
    queryKey: ['purchase-orders', 'active'],
    queryFn: () => purchaseOrderService.getActive(),
  });
}

export function useExpiredPurchaseOrders() {
  return useQuery({
    queryKey: ['purchase-orders', 'expired'],
    queryFn: () => purchaseOrderService.getExpired(),
  });
}

export function useClosedPurchaseOrders() {
  return useQuery({
    queryKey: ['purchase-orders', 'closed'],
    queryFn: () => purchaseOrderService.getClosed(),
  });
}

export function useMaterials() {
  return useQuery({
    queryKey: ['materials'],
    queryFn: () => materialService.getAll(),
  });
}

export function usePurchaseOrderMutations() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createMutation = useMutation({
    mutationFn: (data: POCreate) => purchaseOrderService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      toast({
        title: 'Purchase Order Created',
        description: 'The purchase order has been created successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.detail || 'Failed to create purchase order.',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => purchaseOrderService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      toast({
        title: 'Purchase Order Deleted',
        description: 'The purchase order has been removed successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.detail || 'Failed to delete purchase order.',
      });
    },
  });

  const updateMaterialReceivedMutation = useMutation({
    mutationFn: ({ poId, materialId, receivedQty }: { poId: number; materialId: number; receivedQty: number }) =>
      purchaseOrderService.updateMaterialReceived(poId, materialId, receivedQty),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      toast({
        title: 'Quantity Updated',
        description: 'The received quantity has been updated successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.detail || 'Failed to update received quantity.',
      });
    },
  });

  return {
    createPurchaseOrder: createMutation.mutate,
    deletePurchaseOrder: deleteMutation.mutate,
    updateMaterialReceived: updateMaterialReceivedMutation.mutate,
    isCreating: createMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isUpdating: updateMaterialReceivedMutation.isPending,
  };
}
