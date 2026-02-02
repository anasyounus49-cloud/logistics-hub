// src/hooks/useVehicles.ts
import { useState, useEffect, useCallback } from 'react';
import { vehicleService } from '@/api/services/vehicleService';
import { VehicleOut, VehicleCreate } from '@/api/types/vehicle.types';
import { ApprovalStatus } from '@/api/types/common.types';
import { toast } from '@/hooks/use-toast';

export const useVehicles = () => {
  const [vehicles, setVehicles] = useState<VehicleOut[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all vehicles
  const fetchVehicles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await vehicleService.getAll();
      setVehicles(data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch vehicles';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch pending verification vehicles
  const fetchPendingVehicles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await vehicleService.getPendingVerification();
      setVehicles(data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch pending vehicles';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch recent vehicles
  const fetchRecentVehicles = useCallback(async (limit: number = 10) => {
    setLoading(true);
    setError(null);
    try {
      const data = await vehicleService.getRecent(limit);
      setVehicles(data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch recent vehicles';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // UPDATED: Create new vehicle - NOW ACCEPTS FORMDATA OR VEHICLECREATE
  // Returns the created vehicle and throws error for proper error handling in components
  const createVehicle = async (data: FormData | VehicleCreate): Promise<VehicleOut> => {
    setLoading(true);
    
    console.log('useVehicles.createVehicle called with:', data instanceof FormData ? 'FormData' : 'VehicleCreate object');
    
    try {
      const newVehicle = await vehicleService.create(data);
      setVehicles((prev) => [newVehicle, ...prev]);
      toast({
        title: 'Success',
        description: 'Vehicle created successfully',
      });
      return newVehicle;
    } catch (err: any) {
      console.error('useVehicles.createVehicle error:', err);
      
      // Extract detailed error message from FastAPI response
      const errorDetail = err.response?.data?.detail;
      const errorMessage = Array.isArray(errorDetail)
        ? errorDetail.map((e: any) => `${e.loc?.join('.')}: ${e.msg}`).join(', ')
        : errorDetail || err.response?.data?.message || 'Failed to create vehicle';
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      
      // Re-throw error so calling component can handle it
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Approve vehicle
  const approveVehicle = async (id: number): Promise<boolean> => {
    try {
      const updatedVehicle = await vehicleService.approve(id);
      setVehicles((prev) =>
        prev.map((vehicle) => (vehicle.id === id ? updatedVehicle : vehicle))
      );
      toast({
        title: 'Success',
        description: 'Vehicle approved successfully',
      });
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to approve vehicle';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      return false;
    }
  };

  // Reject vehicle
  const rejectVehicle = async (id: number): Promise<boolean> => {
    try {
      const updatedVehicle = await vehicleService.reject(id);
      setVehicles((prev) =>
        prev.map((vehicle) => (vehicle.id === id ? updatedVehicle : vehicle))
      );
      toast({
        title: 'Success',
        description: 'Vehicle rejected successfully',
      });
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to reject vehicle';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      return false;
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  return {
    vehicles,
    loading,
    error,
    fetchVehicles,
    fetchPendingVehicles,
    fetchRecentVehicles,
    createVehicle,
    approveVehicle,
    rejectVehicle,
    refetch: fetchVehicles,
  };
};