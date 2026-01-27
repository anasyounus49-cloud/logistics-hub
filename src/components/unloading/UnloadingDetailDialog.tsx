import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { EnrichedUnloading } from '@/hooks/useUnloading';
import { format } from 'date-fns';
import { 
  Package, 
  Truck, 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle,
  AlertTriangle,
  User,
} from 'lucide-react';

interface UnloadingDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  unloading: EnrichedUnloading | null;
}

export function UnloadingDetailDialog({
  open,
  onOpenChange,
  unloading,
}: UnloadingDetailDialogProps) {
  if (!unloading) return null;

  const totalQty = unloading.accepted_qty + unloading.rejection_qty;
  const acceptedPercent = totalQty > 0 ? (unloading.accepted_qty / totalQty) * 100 : 100;
  const rejectionRate = unloading.rejection_rate || 0;

  const getQualityStatus = () => {
    if (rejectionRate === 0) {
      return { label: 'Excellent', color: 'bg-success text-success-foreground', icon: CheckCircle };
    } else if (rejectionRate < 5) {
      return { label: 'Good', color: 'bg-info text-info-foreground', icon: CheckCircle };
    } else if (rejectionRate < 15) {
      return { label: 'Fair', color: 'bg-warning text-warning-foreground', icon: AlertTriangle };
    } else {
      return { label: 'Poor', color: 'bg-destructive text-destructive-foreground', icon: XCircle };
    }
  };

  const qualityStatus = getQualityStatus();
  const QualityIcon = qualityStatus.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Unloading Record Details
          </DialogTitle>
          <DialogDescription>
            UNL-{unloading.id.toString().padStart(4, '0')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Quality Summary */}
          <div className="p-6 rounded-xl bg-muted/50 border">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Material</p>
                <p className="text-xl font-bold">{unloading.material_type}</p>
              </div>
              <Badge className={qualityStatus.color}>
                <QualityIcon className="h-3 w-3 mr-1" />
                {qualityStatus.label} Quality
              </Badge>
            </div>

            {/* Quantity Breakdown */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center p-3 rounded-lg bg-background">
                <p className="text-2xl font-bold text-success">{unloading.accepted_qty.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Accepted</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-background">
                <p className="text-2xl font-bold text-destructive">{unloading.rejection_qty.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Rejected</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-background">
                <p className="text-2xl font-bold">{totalQty.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-success">Accepted: {acceptedPercent.toFixed(1)}%</span>
                <span className="text-destructive">Rejected: {rejectionRate.toFixed(1)}%</span>
              </div>
              <div className="flex h-3 rounded-full overflow-hidden bg-destructive/20">
                <div 
                  className="bg-success transition-all" 
                  style={{ width: `${acceptedPercent}%` }}
                />
              </div>
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
                <p className="font-medium">TRP-{unloading.trip_id.toString().padStart(4, '0')}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/30">
                <p className="text-muted-foreground">Trip Status</p>
                <p className="font-medium">{unloading.trip_status || 'N/A'}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/30">
                <p className="text-muted-foreground">Vehicle ID</p>
                <p className="font-medium">
                  {unloading.trip_vehicle_id ? `VEH-${unloading.trip_vehicle_id}` : 'N/A'}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-muted/30">
                <p className="text-muted-foreground">PO ID</p>
                <p className="font-medium">
                  {unloading.trip_po_id ? `PO-${unloading.trip_po_id}` : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Verification Details */}
          <div className="space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Verification Details
            </h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="p-3 rounded-lg bg-muted/30">
                <p className="text-muted-foreground">Verification Time</p>
                <p className="font-medium">
                  {format(new Date(unloading.verification_time), 'MMM dd, yyyy HH:mm:ss')}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-muted/30">
                <p className="text-muted-foreground">Verified By</p>
                <p className="font-medium flex items-center gap-1">
                  <User className="h-3 w-3" />
                  Staff ID: {unloading.staff_id}
                </p>
              </div>
            </div>
          </div>

          {/* Remarks */}
          {unloading.remarks && (
            <div className="space-y-3">
              <h4 className="font-medium">Remarks</h4>
              <div className="p-3 rounded-lg bg-muted/30 text-sm">
                <p>{unloading.remarks}</p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
