// src/components/vehicles/VehicleFormDialog.tsx
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { VehicleCreate, VehicleOut } from '@/api/types/vehicle.types';
import { Plus } from 'lucide-react';

interface VehicleFormDialogProps {
  onSubmit: (data: VehicleCreate | FormData) => Promise<VehicleOut | boolean>;
}

export const VehicleFormDialog = ({ onSubmit }: VehicleFormDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<VehicleCreate>();

  const vehicleType = watch('vehicle_type');

  const handleFormSubmit = async (data: VehicleCreate) => {
    setLoading(true);
    try {
      const result = await onSubmit(data);
      // Success if we get here (either VehicleOut object or true)
      const success = result === true || (typeof result === 'object' && result !== null);
      if (success) {
        reset();
        setOpen(false);
      }
    } catch (error) {
      // Error is already handled by useVehicles hook with toast
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Vehicle
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <DialogHeader>
            <DialogTitle>Add New Vehicle</DialogTitle>
            <DialogDescription>
              Enter the vehicle details below. Click save when you're done.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Registration Number */}
            <div className="grid gap-2">
              <Label htmlFor="registration_number">
                Registration Number <span className="text-red-500">*</span>
              </Label>
              <Input
                id="registration_number"
                placeholder="e.g., ABC-1234"
                {...register('registration_number', {
                  required: 'Registration number is required',
                  pattern: {
                    value: /^[A-Z0-9-]+$/,
                    message: 'Invalid registration format',
                  },
                })}
              />
              {errors.registration_number && (
                <p className="text-sm text-red-500">
                  {errors.registration_number.message}
                </p>
              )}
            </div>

            {/* Vehicle Type */}
            <div className="grid gap-2">
              <Label htmlFor="vehicle_type">
                Vehicle Type <span className="text-red-500">*</span>
              </Label>
              <Select
                value={vehicleType}
                onValueChange={(value) => setValue('vehicle_type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select vehicle type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="truck">Truck</SelectItem>
                  <SelectItem value="trailer">Trailer</SelectItem>
                  <SelectItem value="tanker">Tanker</SelectItem>
                  <SelectItem value="van">Van</SelectItem>
                </SelectContent>
              </Select>
              {errors.vehicle_type && (
                <p className="text-sm text-red-500">
                  {errors.vehicle_type.message}
                </p>
              )}
            </div>

            {/* Manufacturer Tare Weight */}
            <div className="grid gap-2">
              <Label htmlFor="manufacturer_tare_weight">
                Tare Weight (kg) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="manufacturer_tare_weight"
                type="number"
                step="0.01"
                placeholder="e.g., 5000"
                {...register('manufacturer_tare_weight', {
                  required: 'Tare weight is required',
                  valueAsNumber: true,
                  min: {
                    value: 0,
                    message: 'Weight must be positive',
                  },
                })}
              />
              {errors.manufacturer_tare_weight && (
                <p className="text-sm text-red-500">
                  {errors.manufacturer_tare_weight.message}
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Vehicle'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};