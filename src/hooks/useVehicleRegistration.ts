// src/hooks/useVehicleRegistration.ts
import { useQuery } from '@tanstack/react-query';
import { vehicleService } from '@/api/services/vehicleService';

export const useVehicleByRegistration = (registrationNumber?: string) => {
  return useQuery({
    queryKey: ['vehicle-registration', registrationNumber],
    queryFn: () => vehicleService.getByRegistration(registrationNumber as string),
    enabled: !!registrationNumber && registrationNumber.length > 0,
    retry: false, // Don't retry on 404 (not registered)
    // Handle 404 as "not registered" rather than error
    throwOnError: false,
  });
};