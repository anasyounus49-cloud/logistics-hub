import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { EnrichedWeight } from '@/hooks/useWeights';
import { format } from 'date-fns';
import { Scale, Truck, User, FileText, Clock, Camera } from 'lucide-react';

interface WeightDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  weight: EnrichedWeight | null;
}

export function WeightDetailDialog({
  open,
  onOpenChange,
  weight,
}: WeightDetailDialogProps) {
  if (!weight) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5" />
            Weight Record Details
          </DialogTitle>
          <DialogDescription>
            WGT-{weight.id.toString().padStart(4, '0')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Weight Display */}
          <div className="text-center p-6 rounded-xl bg-muted/50 border">
            <p className="text-sm text-muted-foreground mb-1">
              {weight.weight_type} Weight
            </p>
            <p className="text-4xl font-bold text-primary">
              {weight.weight_value.toLocaleString()}
            </p>
            <p className="text-lg text-muted-foreground">kg</p>
            <div className="mt-4">
              <Badge variant={weight.status === 'PASSED' ? 'default' : 'destructive'}>
                {weight.status}
              </Badge>
            </div>
          </div>

          <Separator />

          {/* Trip Information */}
          <div className="space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Trip Information
            </h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="p-3 rounded-lg bg-muted/30">
                <p className="text-muted-foreground">Trip ID</p>
                <p className="font-medium">TRP-{weight.trip_id.toString().padStart(4, '0')}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/30">
                <p className="text-muted-foreground">Trip Status</p>
                <p className="font-medium">{weight.trip_status || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Vehicle & Driver */}
          <div className="space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <Truck className="h-4 w-4" />
              Vehicle & Driver
            </h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="p-3 rounded-lg bg-muted/30">
                <p className="text-muted-foreground">Vehicle ID</p>
                <p className="font-medium">
                  {weight.trip_vehicle_id ? `VEH-${weight.trip_vehicle_id}` : 'N/A'}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-muted/30">
                <p className="text-muted-foreground">Driver ID</p>
                <p className="font-medium">
                  {weight.trip_driver_id ? `DRV-${weight.trip_driver_id}` : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Capture Details */}
          <div className="space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Capture Details
            </h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="p-3 rounded-lg bg-muted/30">
                <p className="text-muted-foreground">Capture Time</p>
                <p className="font-medium">
                  {format(new Date(weight.capture_time), 'MMM dd, yyyy HH:mm:ss')}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-muted/30">
                <p className="text-muted-foreground">Operator ID</p>
                <p className="font-medium">OP-{weight.operator_id}</p>
              </div>
            </div>
          </div>

          {/* Camera Image */}
          {weight.camera_image_refs && (
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <Camera className="h-4 w-4" />
                Camera Image
              </h4>
              <div className="p-3 rounded-lg bg-muted/30 text-sm">
                <p className="text-muted-foreground break-all">{weight.camera_image_refs}</p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
