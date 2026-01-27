import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/common/StatusBadge';
import { EnrichedWeight } from '@/hooks/useWeights';
import { Eye, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

interface WeightTableProps {
  weights: EnrichedWeight[];
  isLoading: boolean;
  onView: (weight: EnrichedWeight) => void;
  onEdit: (weight: EnrichedWeight) => void;
  onDelete: (weight: EnrichedWeight) => void;
}

export function WeightTable({ 
  weights, 
  isLoading, 
  onView, 
  onEdit, 
  onDelete 
}: WeightTableProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (weights.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No weight records found</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead>ID</TableHead>
            <TableHead>Trip</TableHead>
            <TableHead>Type</TableHead>
            <TableHead className="text-right">Weight (kg)</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Capture Time</TableHead>
            <TableHead>Vehicle ID</TableHead>
            <TableHead>Operator ID</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {weights.map((weight) => (
            <TableRow key={weight.id} className="hover:bg-muted/30">
              <TableCell className="font-medium">
                WGT-{weight.id.toString().padStart(4, '0')}
              </TableCell>
              <TableCell>
                <span className="text-primary font-medium">
                  TRP-{weight.trip_id.toString().padStart(4, '0')}
                </span>
              </TableCell>
              <TableCell>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  weight.weight_type === 'Gross' 
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' 
                    : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                }`}>
                  {weight.weight_type}
                </span>
              </TableCell>
              <TableCell className="text-right font-mono font-semibold">
                {weight.weight_value.toLocaleString()}
              </TableCell>
              <TableCell>
                <StatusBadge 
                  status={weight.status === 'PASSED' ? 'approved' : 'rejected'} 
                />
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {format(new Date(weight.capture_time), 'MMM dd, yyyy HH:mm')}
              </TableCell>
              <TableCell>
                {weight.trip_vehicle_id ? `VEH-${weight.trip_vehicle_id}` : '-'}
              </TableCell>
              <TableCell>
                {weight.operator_id ? `OP-${weight.operator_id}` : '-'}
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onView(weight)}
                    title="View details"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(weight)}
                    title="Edit"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(weight)}
                    title="Delete"
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
