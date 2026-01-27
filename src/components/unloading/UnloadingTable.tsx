import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { EnrichedUnloading } from '@/hooks/useUnloading';
import { Eye, Edit, Trash2, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';

interface UnloadingTableProps {
  unloadings: EnrichedUnloading[];
  isLoading: boolean;
  onView: (unloading: EnrichedUnloading) => void;
  onEdit: (unloading: EnrichedUnloading) => void;
  onDelete: (unloading: EnrichedUnloading) => void;
}

export function UnloadingTable({ 
  unloadings, 
  isLoading, 
  onView, 
  onEdit, 
  onDelete 
}: UnloadingTableProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (unloadings.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No unloading records found</p>
      </div>
    );
  }

  const getQualityBadge = (rejectionRate: number) => {
    if (rejectionRate === 0) {
      return <Badge className="bg-success text-success-foreground">Excellent</Badge>;
    } else if (rejectionRate < 5) {
      return <Badge className="bg-info text-info-foreground">Good</Badge>;
    } else if (rejectionRate < 15) {
      return <Badge variant="secondary">Fair</Badge>;
    } else {
      return <Badge variant="destructive">Poor</Badge>;
    }
  };

  return (
    <div className="rounded-lg border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead>ID</TableHead>
            <TableHead>Trip</TableHead>
            <TableHead>Material</TableHead>
            <TableHead className="text-right">Accepted</TableHead>
            <TableHead className="text-right">Rejected</TableHead>
            <TableHead>Quality</TableHead>
            <TableHead>Verification Time</TableHead>
            <TableHead>Staff ID</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {unloadings.map((unloading) => {
            const totalQty = unloading.accepted_qty + unloading.rejection_qty;
            const acceptedPercent = totalQty > 0 ? (unloading.accepted_qty / totalQty) * 100 : 100;
            
            return (
              <TableRow key={unloading.id} className="hover:bg-muted/30">
                <TableCell className="font-medium">
                  UNL-{unloading.id.toString().padStart(4, '0')}
                </TableCell>
                <TableCell>
                  <span className="text-primary font-medium">
                    TRP-{unloading.trip_id.toString().padStart(4, '0')}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="font-medium">{unloading.material_type}</span>
                </TableCell>
                <TableCell className="text-right">
                  <span className="font-mono text-success font-semibold">
                    {unloading.accepted_qty.toLocaleString()}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    {unloading.rejection_qty > 0 && (
                      <AlertTriangle className="h-4 w-4 text-destructive" />
                    )}
                    <span className={`font-mono font-semibold ${
                      unloading.rejection_qty > 0 ? 'text-destructive' : 'text-muted-foreground'
                    }`}>
                      {unloading.rejection_qty.toLocaleString()}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    {getQualityBadge(unloading.rejection_rate || 0)}
                    <Progress 
                      value={acceptedPercent} 
                      className="h-1.5 w-20"
                    />
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {format(new Date(unloading.verification_time), 'MMM dd, HH:mm')}
                </TableCell>
                <TableCell>
                  OP-{unloading.staff_id}
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onView(unloading)}
                      title="View details"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(unloading)}
                      title="Edit"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(unloading)}
                      title="Delete"
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
