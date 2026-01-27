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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { EnrichedWeight, useTripsForWeightCapture } from '@/hooks/useWeights';
import { WeightCreate } from '@/api/types/trip.types';
import { Scale, Loader2 } from 'lucide-react';

const weightSchema = z.object({
  trip_id: z.number({ required_error: 'Trip is required' }).min(1, 'Trip is required'),
  weight_type: z.enum(['Gross', 'Tare'], { required_error: 'Weight type is required' }),
  weight_value: z.number({ required_error: 'Weight value is required' })
    .min(1, 'Weight must be greater than 0')
    .max(100000, 'Weight cannot exceed 100,000 kg'),
  status: z.enum(['PASSED', 'FAILED'], { required_error: 'Status is required' }),
  camera_image_refs: z.string().nullable().optional(),
});

type WeightFormData = z.infer<typeof weightSchema>;

interface WeightFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  weight?: EnrichedWeight | null;
  onSubmit: (data: WeightCreate) => Promise<void>;
  isSubmitting: boolean;
}

export function WeightFormDialog({
  open,
  onOpenChange,
  weight,
  onSubmit,
  isSubmitting,
}: WeightFormDialogProps) {
  const { trips, allActiveTrips, isLoading: loadingTrips } = useTripsForWeightCapture();
  const isEdit = !!weight;

  const form = useForm<WeightFormData>({
    resolver: zodResolver(weightSchema),
    defaultValues: {
      trip_id: 0,
      weight_type: 'Gross',
      weight_value: 0,
      status: 'PASSED',
      camera_image_refs: null,
    },
  });

  useEffect(() => {
    if (weight) {
      form.reset({
        trip_id: weight.trip_id,
        weight_type: weight.weight_type,
        weight_value: weight.weight_value,
        status: weight.status,
        camera_image_refs: weight.camera_image_refs,
      });
    } else {
      form.reset({
        trip_id: 0,
        weight_type: 'Gross',
        weight_value: 0,
        status: 'PASSED',
        camera_image_refs: null,
      });
    }
  }, [weight, form, open]);

  const handleSubmit = async (data: WeightFormData) => {
    await onSubmit({
      trip_id: data.trip_id,
      weight_type: data.weight_type,
      weight_value: data.weight_value,
      status: data.status,
      camera_image_refs: data.camera_image_refs || null,
    });
  };

  // Determine which trips to show - for editing, show all active trips; for creating, show trips needing weight
  const availableTrips = isEdit ? allActiveTrips : trips;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5" />
            {isEdit ? 'Edit Weight Record' : 'Capture Weight'}
          </DialogTitle>
          <DialogDescription>
            {isEdit 
              ? 'Update the weight record details below.' 
              : 'Record a new weight measurement for a trip.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="trip_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Trip *</FormLabel>
                  <Select
                    disabled={loadingTrips || isEdit}
                    value={field.value?.toString() || ''}
                    onValueChange={(value) => field.onChange(parseInt(value, 10))}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a trip" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableTrips.map((trip) => (
                        <SelectItem key={trip.id} value={trip.id.toString()}>
                          TRP-{trip.id.toString().padStart(4, '0')} ({trip.current_stage.replace('_', ' ')})
                        </SelectItem>
                      ))}
                      {availableTrips.length === 0 && (
                        <SelectItem value="none" disabled>
                          No trips available for weight capture
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="weight_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Weight Type *</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Gross">Gross Weight</SelectItem>
                        <SelectItem value="Tare">Tare Weight</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status *</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="PASSED">Passed</SelectItem>
                        <SelectItem value="FAILED">Failed</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="weight_value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Weight Value (kg) *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type="number"
                        placeholder="Enter weight in kg"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        className="pr-12"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                        kg
                      </span>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="camera_image_refs"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Camera Image Reference</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Optional image reference URL"
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="gap-2">
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {isEdit ? 'Update Record' : 'Capture Weight'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
