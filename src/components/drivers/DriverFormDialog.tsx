import { useEffect } from 'react';
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
import { DriverOut, DriverCreate } from '@/api/types/driver.types';

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

interface DriverFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  driver?: DriverOut | null;
  onSubmit: (data: DriverCreate) => void;
  isLoading?: boolean;
}

export function DriverFormDialog({
  open,
  onOpenChange,
  driver,
  onSubmit,
  isLoading,
}: DriverFormDialogProps) {
  const isEditing = !!driver;

  const form = useForm<DriverFormValues>({
    resolver: zodResolver(driverSchema),
    defaultValues: {
      driver_name: '',
      mobile_number: '',
      aadhaar: '',
    },
  });

  useEffect(() => {
    if (driver) {
      form.reset({
        driver_name: driver.driver_name,
        mobile_number: driver.mobile_number,
        aadhaar: driver.aadhaar || '',
      });
    } else {
      form.reset({
        driver_name: '',
        mobile_number: '',
        aadhaar: '',
      });
    }
  }, [driver, form]);

  const handleSubmit = (values: DriverFormValues) => {
    onSubmit({
      driver_name: values.driver_name,
      mobile_number: values.mobile_number,
      aadhaar: values.aadhaar,
    });
    onOpenChange(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Driver' : 'Register New Driver'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update driver information below.'
              : 'Enter the driver details to register them in the system.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
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

            <FormField
              control={form.control}
              name="mobile_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mobile Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter 10-digit mobile number" {...field} />
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
                      placeholder="Enter 12-digit Aadhaar number"
                      maxLength={12}
                      {...field}
                    />
                  </FormControl>
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
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : isEditing ? 'Save Changes' : 'Register Driver'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
