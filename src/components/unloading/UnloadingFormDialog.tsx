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
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { EnrichedUnloading, useTripsForUnloading, useMaterialsList } from '@/hooks/useUnloading';
import { MaterialUnloadingCreate } from '@/api/types/trip.types';
import { Package, Loader2, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

const unloadingSchema = z.object({
  trip_id: z.number({ required_error: 'Trip is required' }).min(1, 'Trip is required'),
  material_type: z.string().min(1, 'Material type is required').max(100, 'Material type too long'),
  accepted_qty: z.number({ required_error: 'Accepted quantity is required' })
    .min(0, 'Cannot be negative'),
  rejection_qty: z.number()
    .min(0, 'Cannot be negative')
    .default(0),
  remarks: z.string().max(500, 'Remarks too long').nullable().optional(),
});

type UnloadingFormData = z.infer<typeof unloadingSchema>;

interface UnloadingFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  unloading?: EnrichedUnloading | null;
  onSubmit: (data: MaterialUnloadingCreate) => Promise<void>;
  isSubmitting: boolean;
}

export function UnloadingFormDialog({
  open,
  onOpenChange,
  unloading,
  onSubmit,
  isSubmitting,
}: UnloadingFormDialogProps) {
  const { trips, allActiveTrips, isLoading: loadingTrips } = useTripsForUnloading();
  const { data: materials, isLoading: loadingMaterials } = useMaterialsList();
  const isEdit = !!unloading;

  const form = useForm<UnloadingFormData>({
    resolver: zodResolver(unloadingSchema),
    defaultValues: {
      trip_id: 0,
      material_type: '',
      accepted_qty: 0,
      rejection_qty: 0,
      remarks: null,
    },
  });

  const watchedAccepted = form.watch('accepted_qty');
  const watchedRejected = form.watch('rejection_qty');
  const totalQty = (watchedAccepted || 0) + (watchedRejected || 0);
  const rejectionRate = totalQty > 0 ? ((watchedRejected || 0) / totalQty) * 100 : 0;

  useEffect(() => {
    if (unloading) {
      form.reset({
        trip_id: unloading.trip_id,
        material_type: unloading.material_type,
        accepted_qty: unloading.accepted_qty,
        rejection_qty: unloading.rejection_qty,
        remarks: unloading.remarks,
      });
    } else {
      form.reset({
        trip_id: 0,
        material_type: '',
        accepted_qty: 0,
        rejection_qty: 0,
        remarks: null,
      });
    }
  }, [unloading, form, open]);

  const handleSubmit = async (data: UnloadingFormData) => {
    await onSubmit({
      trip_id: data.trip_id,
      material_type: data.material_type,
      accepted_qty: data.accepted_qty,
      rejection_qty: data.rejection_qty,
      remarks: data.remarks || null,
    });
  };

  const getQualityIndicator = () => {
    if (totalQty === 0) return null;
    
    if (rejectionRate === 0) {
      return (
        <div className="flex items-center gap-2 text-success">
          <CheckCircle className="h-5 w-5" />
          <span className="font-medium">Excellent Quality</span>
        </div>
      );
    } else if (rejectionRate < 5) {
      return (
        <div className="flex items-center gap-2 text-info">
          <CheckCircle className="h-5 w-5" />
          <span className="font-medium">Good Quality ({rejectionRate.toFixed(1)}% rejected)</span>
        </div>
      );
    } else if (rejectionRate < 15) {
      return (
        <div className="flex items-center gap-2 text-warning">
          <AlertTriangle className="h-5 w-5" />
          <span className="font-medium">Fair Quality ({rejectionRate.toFixed(1)}% rejected)</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center gap-2 text-destructive">
          <XCircle className="h-5 w-5" />
          <span className="font-medium">Poor Quality ({rejectionRate.toFixed(1)}% rejected)</span>
        </div>
      );
    }
  };

  // Determine which trips to show
  const availableTrips = isEdit ? allActiveTrips : trips;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            {isEdit ? 'Edit Unloading Record' : 'Quality Verification'}
          </DialogTitle>
          <DialogDescription>
            {isEdit 
              ? 'Update the unloading verification details.' 
              : 'Record material unloading with quality verification.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
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
                          <SelectValue placeholder="Select trip" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableTrips.map((trip) => (
                          <SelectItem key={trip.id} value={trip.id.toString()}>
                            TRP-{trip.id.toString().padStart(4, '0')}
                          </SelectItem>
                        ))}
                        {availableTrips.length === 0 && (
                          <SelectItem value="none" disabled>
                            No trips at unloading stage
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="material_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Material Type *</FormLabel>
                    <Select
                      disabled={loadingMaterials}
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select material" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {materials?.map((material) => (
                          <SelectItem key={material.id} value={material.name}>
                            {material.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Quantity Section */}
            <Card className="border-2">
              <CardContent className="pt-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="accepted_qty"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-success" />
                          Accepted Qty *
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            className="font-mono"
                          />
                        </FormControl>
                        <FormDescription>Quantity passed quality check</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="rejection_qty"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <XCircle className="h-4 w-4 text-destructive" />
                          Rejected Qty
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            className="font-mono"
                          />
                        </FormControl>
                        <FormDescription>Quantity failed quality check</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Quality Indicator */}
                <div className="pt-2 border-t">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      Total: <span className="font-mono font-semibold">{totalQty.toLocaleString()}</span>
                    </div>
                    {getQualityIndicator()}
                  </div>
                </div>
              </CardContent>
            </Card>

            <FormField
              control={form.control}
              name="remarks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Remarks</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add any notes about quality issues, reasons for rejection, etc."
                      className="resize-none"
                      rows={3}
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
                {isEdit ? 'Update Record' : 'Submit Verification'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
