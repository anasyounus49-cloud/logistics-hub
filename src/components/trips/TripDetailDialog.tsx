import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { TripOut } from '@/api/types/trip.types';
import { TripStage } from '@/api/types/common.types';
import { TripStageProgress } from '@/components/common/TripStageProgress';
import { StatusBadge } from '@/components/common/StatusBadge';
import { useTripStages } from '@/hooks/useTrips';
import { Loader2, Truck, User, FileText, Scale, Clock, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';

interface TripDetailDialogProps {
  trip: TripOut | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TripDetailDialog({
  trip,
  open,
  onOpenChange,
}: TripDetailDialogProps) {
  const { data: stageHistory, isLoading: loadingHistory } = useTripStages(trip?.id ?? null);

  if (!trip) return null;

  const netWeight =
    trip.gross_weight && trip.tare_weight
      ? trip.gross_weight - trip.tare_weight
      : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Trip TRP-{trip.id.toString().padStart(4, '0')}
            <StatusBadge status={trip.status.toLowerCase()} />
          </DialogTitle>
          <DialogDescription>
            Created on {format(new Date(trip.created_at), 'MMMM d, yyyy HH:mm')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress */}
          <div className="p-4 rounded-lg bg-muted/30 border">
            <p className="text-sm font-medium mb-3">Current Progress</p>
            <TripStageProgress currentStage={trip.current_stage as TripStage} />
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border bg-card">
              <div className="flex items-center gap-2 mb-2">
                <Truck className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Vehicle</span>
              </div>
              <p className="text-lg font-semibold">VEH-{trip.vehicle_id}</p>
            </div>

            <div className="p-4 rounded-lg border bg-card">
              <div className="flex items-center gap-2 mb-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Driver</span>
              </div>
              <p className="text-lg font-semibold">DRV-{trip.driver_id}</p>
            </div>

            <div className="p-4 rounded-lg border bg-card">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Purchase Order</span>
              </div>
              <p className="text-lg font-semibold">PO-{trip.po_id}</p>
            </div>

            <div className="p-4 rounded-lg border bg-card">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Completed</span>
              </div>
              <p className="text-lg font-semibold">
                {trip.completed_at
                  ? format(new Date(trip.completed_at), 'MMM d, HH:mm')
                  : '—'}
              </p>
            </div>
          </div>

          {/* Weights */}
          <div className="p-4 rounded-lg border bg-card">
            <div className="flex items-center gap-2 mb-4">
              <Scale className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Weight Information</span>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Gross Weight</p>
                <p className="text-xl font-bold">
                  {trip.gross_weight ? `${trip.gross_weight.toLocaleString()} kg` : '—'}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Tare Weight</p>
                <p className="text-xl font-bold">
                  {trip.tare_weight ? `${trip.tare_weight.toLocaleString()} kg` : '—'}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Net Weight</p>
                <p className="text-xl font-bold text-primary">
                  {netWeight ? `${netWeight.toLocaleString()} kg` : '—'}
                </p>
              </div>
            </div>
          </div>

          {/* Stage History */}
          <div>
            <p className="text-sm font-medium mb-3">Stage History</p>
            {loadingHistory ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {stageHistory?.map((stage) => (
                  <div
                    key={stage.id}
                    className="flex items-start gap-3 p-3 rounded-lg bg-muted/20 border"
                  >
                    <CheckCircle2 className="h-4 w-4 text-success mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">{stage.stage_name}</p>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(stage.action_timestamp), 'HH:mm')}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(stage.action_timestamp), 'MMM d, yyyy')} •
                        Staff ID: {stage.staff_id} ({stage.role})
                      </p>
                      {stage.remarks && (
                        <p className="text-xs text-muted-foreground mt-1 italic">
                          "{stage.remarks}"
                        </p>
                      )}
                    </div>
                  </div>
                ))}
                {(!stageHistory || stageHistory.length === 0) && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No stage history recorded
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
