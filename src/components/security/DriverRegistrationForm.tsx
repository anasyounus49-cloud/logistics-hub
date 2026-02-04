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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useCreateDriver } from '@/hooks/useDrivers';
import { Plus, Loader2, AlertCircle, User } from 'lucide-react';

const driverSchema = z.object({
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

type DriverFormValues = z.infer<typeof driverSchema>;

interface DriverRegistrationFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (driverId: number, driverPhone: string) => void;
}

export function DriverRegistrationForm({
  open,
  onOpenChange,
  onSuccess,
}: DriverRegistrationFormProps) {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const createDriver = useCreateDriver();

  const form = useForm<DriverFormValues>({
    resolver: zodResolver(driverSchema),
    defaultValues: {
      driver_name: '',
      mobile_number: '',
      aadhaar: '',
    },
  });

  const handleSubmit = async (values: DriverFormValues) => {
    setSubmitError(null);

    try {
      const driverPayload = {
        driver_name: values.driver_name.trim(),
        mobile_number: values.mobile_number.trim(),
        aadhaar: values.aadhaar.trim(),
      };

      const result = await createDriver.mutateAsync(driverPayload);

      // Close dialog and reset form
      onOpenChange(false);
      form.reset();

      // Notify parent with new driver info
      onSuccess?.(result.id, values.mobile_number.trim());
    } catch (error: any) {
      console.error('Driver creation failed:', error);

      const errorDetail = error.response?.data?.detail;
      const errorMessage = Array.isArray(errorDetail)
        ? errorDetail.map((e: any) => `${e.loc?.join('.')}: ${e.msg}`).join(', ')
        : errorDetail || error.message || 'Failed to create driver';

      setSubmitError(errorMessage);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
    form.reset();
    setSubmitError(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Register New Driver
          </DialogTitle>
          <DialogDescription>
            Add a new driver to the system. They will be pending approval.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {/* Error Alert */}
            {submitError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{submitError}</AlertDescription>
              </Alert>
            )}

            <FormField
              control={form.control}
              name="driver_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter driver's full name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="mobile_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mobile Number *</FormLabel>
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
                  <FormLabel>Aadhaar Number *</FormLabel>
                  <FormControl>
                    <Input placeholder="12-digit Aadhaar" maxLength={12} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={createDriver.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createDriver.isPending} className="gap-2">
                {createDriver.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Registering...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    Register Driver
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