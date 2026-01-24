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
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { EnrichedTrip } from '@/hooks/useTrips';
import { TripStage } from '@/api/types/common.types';
import { TripStageProgress } from '@/components/common/TripStageProgress';
import { useAdvanceStage, useTripStages } from '@/hooks/useTrips';
import { Loader2, ArrowRight, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

const stageOrder: TripStage[] = [
  'ENTRY_GATE',
  'GROSS_WEIGHT',
  'UNLOADING',
  'TARE_WEIGHT',
  'EXIT_GATE',
];

const stageLabels: Record<TripStage, string> = {
  ENTRY_GATE: 'Entry Gate',
  GROSS_WEIGHT: 'Gross Weight',
  UNLOADING: 'Unloading',
  TARE_WEIGHT: 'Tare Weight',
  EXIT_GATE: 'Exit Gate',
};

const advanceSchema = z.object({
  remarks: z.string().max(500).optional(),
});

type AdvanceFormValues = z.infer<typeof advanceSchema>;

interface StageAdvanceDialogProps {
  trip: EnrichedTrip | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function StageAdvanceDialog({
  trip,
  open,
  onOpenChange,
}: StageAdvanceDialogProps) {
  const { mutate: advanceStage, isPending } = useAdvanceStage();
  const { data: stageHistory, isLoading: loadingHistory } = useTripStages(trip?.id ?? null);

  const form = useForm<AdvanceFormValues>({
    resolver: zodResolver(advanceSchema),
    defaultValues: {
      remarks: '',
    },
  });

  if (!trip) return null;

  const currentIndex = stageOrder.indexOf(trip.current_stage as TripStage);
  const nextStage = stageOrder[currentIndex + 1];
  const isLastStage = currentIndex >= stageOrder.length - 1;

  const onSubmit = (data: AdvanceFormValues) => {
    if (!nextStage) return;

    advanceStage(
      {
        tripId: trip.id,
        data: {
          next_stage: nextStage,
          remarks: data.remarks || null,
        },
      },
      {
        onSuccess: () => {
          form.reset();
          onOpenChange(false);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Advance Trip Stage
            <Badge variant="outline" className="font-mono">
              TRP-{trip.id.toString().padStart(4, '0')}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Vehicle: {trip.vehicle_registration || `VEH-${trip.vehicle_id}`} • 
            Driver: {trip.driver_name || `DRV-${trip.driver_id}`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Progress */}
          <div className="p-4 rounded-lg bg-muted/30 border">
            <p className="text-sm font-medium mb-3">Trip Progress</p>
            <TripStageProgress currentStage={trip.current_stage as TripStage} />
          </div>

          {/* Stage History */}
          <div className="space-y-2">
            <p className="text-sm font-medium">Stage History</p>
            {loadingHistory ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {stageHistory?.map((stage) => (
                  <div
                    key={stage.id}
                    className="flex items-start gap-3 p-2 rounded bg-muted/20"
                  >
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{stage.stage_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(stage.action_timestamp), 'MMM d, yyyy HH:mm')} •
                        Staff ID: {stage.staff_id}
                      </p>
                      {stage.remarks && (
                        <p className="text-xs text-muted-foreground mt-1">
                          "{stage.remarks}"
                        </p>
                      )}
                    </div>
                  </div>
                ))}
                {(!stageHistory || stageHistory.length === 0) && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No stage history yet
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Advance Form */}
          {!isLastStage && nextStage && (
            <div className="p-4 rounded-lg border border-primary/20 bg-primary/5">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                  <ArrowRight className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">Next Stage</p>
                  <p className="text-lg font-semibold text-primary">
                    {stageLabels[nextStage]}
                  </p>
                </div>
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="remarks"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Remarks (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Add any notes about this stage transition..."
                            className="resize-none"
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
                    <Button type="submit" disabled={isPending}>
                      {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Advance to {stageLabels[nextStage]}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </div>
          )}

          {isLastStage && (
            <div className="p-4 rounded-lg border bg-primary/10 text-center">
              <CheckCircle2 className="h-8 w-8 text-primary mx-auto mb-2" />
              <p className="font-medium">Trip Completed</p>
              <p className="text-sm text-muted-foreground">
                This trip has reached the final stage
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
