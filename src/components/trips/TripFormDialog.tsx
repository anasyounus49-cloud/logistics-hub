import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useCreateTrip } from '@/hooks/useTrips';
import { useApprovedDrivers } from '@/hooks/useDrivers';
import { useVehicles } from '@/hooks/useVehicles';
import { useActivePurchaseOrders } from '@/hooks/usePurchaseOrders';
import { Loader2 } from 'lucide-react';

const tripSchema = z.object({
  vehicle_id: z.string().min(1, 'Vehicle is required'),
  driver_id: z.string().min(1, 'Driver is required'),
  po_id: z.string().min(1, 'Purchase Order is required'),
});

type TripFormValues = z.infer<typeof tripSchema>;

interface TripFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TripFormDialog({ open, onOpenChange }: TripFormDialogProps) {
  const { mutate: createTrip, isPending } = useCreateTrip();
  const { data: drivers, isLoading: loadingDrivers } = useApprovedDrivers();
  const { vehicles, loading: loadingVehicles } = useVehicles();
  const { data: purchaseOrders, isLoading: loadingPOs } = useActivePurchaseOrders();

  const form = useForm<TripFormValues>({
    resolver: zodResolver(tripSchema),
    defaultValues: {
      vehicle_id: '',
      driver_id: '',
      po_id: '',
    },
  });

  const approvedVehicles = vehicles.filter((v) => v.approval_status === 'Approved');

  const onSubmit = (data: TripFormValues) => {
    createTrip(
      {
        vehicle_id: parseInt(data.vehicle_id),
        driver_id: parseInt(data.driver_id),
        po_id: parseInt(data.po_id),
      },
      {
        onSuccess: () => {
          form.reset();
          onOpenChange(false);
        },
      }
    );
  };

  const isLoadingData = loadingDrivers || loadingVehicles || loadingPOs;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Start New Trip</DialogTitle>
          <DialogDescription>
            Create a new trip by selecting a vehicle, driver, and purchase order.
          </DialogDescription>
        </DialogHeader>

        {isLoadingData ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="vehicle_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vehicle</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a vehicle" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {approvedVehicles.map((vehicle) => (
                          <SelectItem key={vehicle.id} value={vehicle.id.toString()}>
                            {vehicle.registration_number} ({vehicle.vehicle_type})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="driver_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Driver</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a driver" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {drivers?.map((driver) => (
                          <SelectItem key={driver.id} value={driver.id.toString()}>
                            {driver.driver_name} ({driver.mobile_number})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="po_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Purchase Order</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a purchase order" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {purchaseOrders?.map((po) => (
                          <SelectItem key={po.id} value={po.id.toString()}>
                            {po.po_reference_number} - {po.seller_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Start Trip
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
