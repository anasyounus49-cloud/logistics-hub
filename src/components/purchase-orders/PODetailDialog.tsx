import { POOut } from '@/api/types/purchaseOrder.types';
import { MaterialOut } from '@/api/types/material.types';
import { StatusBadge } from '@/components/common/StatusBadge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { format } from 'date-fns';
import { FileText, User, Phone, CreditCard, Calendar, Package } from 'lucide-react';

interface PODetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  purchaseOrder: POOut | null;
  materials: MaterialOut[];
}

export function PODetailDialog({
  open,
  onOpenChange,
  purchaseOrder,
  materials,
}: PODetailDialogProps) {
  if (!purchaseOrder) return null;

  const getMaterialName = (materialId: number) => {
    const material = materials.find((m) => m.id === materialId);
    return material ? `${material.name}${material.grade ? ` (${material.grade})` : ''}` : `Material #${materialId}`;
  };

  const getStatusVariant = (status: string): 'active' | 'pending' | 'approved' | 'rejected' | 'completed' => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'active';
      case 'expired':
        return 'rejected';
      case 'closed':
        return 'completed';
      default:
        return 'pending';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle>{purchaseOrder.po_reference_number}</DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">Purchase Order Details</p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status Badge */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Status:</span>
            <StatusBadge status={getStatusVariant(purchaseOrder.status)} />
          </div>

          {/* Seller Information */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
              Seller Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-lg bg-muted/30 border">
              <div className="flex items-start gap-3">
                <User className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Seller Name</p>
                  <p className="font-medium">{purchaseOrder.seller_name}</p>
                </div>
              </div>
              {purchaseOrder.seller_mobile && (
                <div className="flex items-start gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Mobile</p>
                    <p className="font-medium">{purchaseOrder.seller_mobile}</p>
                  </div>
                </div>
              )}
              {purchaseOrder.seller_aadhaar && (
                <div className="flex items-start gap-3">
                  <CreditCard className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Aadhaar</p>
                    <p className="font-medium">XXXX-XXXX-{purchaseOrder.seller_aadhaar.slice(-4)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Validity Period */}
          {purchaseOrder.validity_start_date && purchaseOrder.validity_end_date && (
            <div className="space-y-3">
              <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                Validity Period
              </h4>
              <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/30 border">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div className="flex items-center gap-2">
                  <span className="font-medium">
                    {format(new Date(purchaseOrder.validity_start_date), 'dd MMM yyyy')}
                  </span>
                  <span className="text-muted-foreground">to</span>
                  <span className="font-medium">
                    {format(new Date(purchaseOrder.validity_end_date), 'dd MMM yyyy')}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Materials */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
              Materials ({purchaseOrder.materials.length})
            </h4>
            <div className="space-y-3">
              {purchaseOrder.materials.map((mat, idx) => {
                const received = mat.received_qty || 0;
                const needed = mat.needed_qty;
                const percentage = (received / needed) * 100;

                return (
                  <div key={idx} className="p-4 rounded-lg bg-muted/30 border">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Package className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{getMaterialName(mat.material_id)}</p>
                          <p className="text-sm text-muted-foreground">
                            {received} / {needed} {purchaseOrder.units || 'MT'}
                          </p>
                        </div>
                      </div>
                      <span className="text-sm font-medium">
                        {percentage.toFixed(0)}%
                      </span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
