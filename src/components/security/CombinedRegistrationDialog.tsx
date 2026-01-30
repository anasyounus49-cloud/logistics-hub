import { useState } from 'react';
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
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useCreateDriver } from '@/hooks/useDrivers';
import { useVehicles } from '@/hooks/useVehicles';
import { useToast } from '@/hooks/use-toast';
import { Plus, Car, User, Loader2 } from 'lucide-react';

const combinedSchema = z.object({
  // Vehicle fields
  registration_number: z
    .string()
    .min(4, 'Registration number must be at least 4 characters')
    .max(15, 'Registration number must be less than 15 characters')
    .regex(/^[A-Z0-9\-]+$/i, 'Invalid registration number format'),
  vehicle_type: z.string().min(1, 'Please select a vehicle type'),
  manufacturer_tare_weight: z
    .string()
    .min(1, 'Tare weight is required')
    .transform((val) => parseFloat(val))
    .refine((val) => !isNaN(val) && val > 0, 'Must be a positive number'),
  // Driver fields
  driver_name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  mobile_number: z
    .string()
    .min(10, 'Mobile number must be 10 digits')
    .max(15)
    .regex(/^[0-9+\-\s]+$/, 'Invalid mobile number format'),
  aadhaar: z
    .string()
    .length(12, 'Aadhaar must be exactly 12 digits')
    .regex(/^\d+$/, 'Aadhaar must contain only digits'),
});

type CombinedFormValues = z.infer<typeof combinedSchema>;

const VEHICLE_TYPES = [
  { value: 'TRUCK', label: 'Truck' },
  { value: 'TRAILER', label: 'Trailer' },
  { value: 'TIPPER', label: 'Tipper' },
  { value: 'TANKER', label: 'Tanker' },
  { value: 'CONTAINER', label: 'Container' },
];

interface CombinedRegistrationDialogProps {
  onSuccess?: () => void;
  trigger?: React.ReactNode;
}

export function CombinedRegistrationDialog({ 
  onSuccess,
  trigger 
}: CombinedRegistrationDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const createDriver = useCreateDriver();
  const { createVehicle } = useVehicles();

  const form = useForm<CombinedFormValues>({
    resolver: zodResolver(combinedSchema),
    defaultValues: {
      registration_number: '',
      vehicle_type: '',
      manufacturer_tare_weight: '' as any,
      driver_name: '',
      mobile_number: '',
      aadhaar: '',
    },
  });

  const handleSubmit = async (values: CombinedFormValues) => {
    setIsSubmitting(true);
    
    try {
      // Register both vehicle and driver in parallel
      const [vehicleSuccess] = await Promise.all([
        createVehicle({
          registration_number: values.registration_number.toUpperCase(),
          vehicle_type: values.vehicle_type,
          manufacturer_tare_weight: values.manufacturer_tare_weight as number,
        }),
        createDriver.mutateAsync({
          driver_name: values.driver_name,
          mobile_number: values.mobile_number,
          aadhaar_encrypted: values.aadhaar,
        }),
      ]);

      if (vehicleSuccess) {
        toast({
          title: 'Registration Successful',
          description: 'Both vehicle and driver have been registered and are pending approval.',
        });
        setOpen(false);
        form.reset();
        onSuccess?.();
      }
    } catch (error: any) {
      toast({
        title: 'Registration Failed',
        description: error.message || 'Failed to complete registration. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="w-full">
            <Plus className="h-4 w-4" />
            Register Vehicle & Driver
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Combined Registration</DialogTitle>
          <DialogDescription>
            Register both vehicle and driver in a single request for faster processing.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Vehicle Section */}
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Car className="h-4 w-4" />
                  Vehicle Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="registration_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Registration Number</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., MH12AB1234" 
                          {...field} 
                          className="uppercase"
                          onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="vehicle_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vehicle Type</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-background">
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-popover border shadow-md z-50">
                            {VEHICLE_TYPES.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
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
                    name="manufacturer_tare_weight"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tare Weight (kg)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="e.g., 12000" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            <Separator />

            {/* Driver Section */}
            <Card className="border-success/20 bg-success/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Driver Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="driver_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter driver's full name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="mobile_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mobile Number</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter 10-digit number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="aadhaar"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Aadhaar Number</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="12-digit Aadhaar" 
                            maxLength={12} 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="gap-2">
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Registering...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    Register Both
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
