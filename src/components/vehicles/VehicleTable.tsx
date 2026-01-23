// src/components/vehicles/VehicleTable.tsx
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
import { VehicleOut } from '@/api/types/vehicle.types';
import { StatusBadge } from '@/components/common/StatusBadge';
import { CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface VehicleTableProps {
  vehicles: VehicleOut[];
  loading: boolean;
  onApprove: (id: number) => Promise<boolean>;
  onReject: (id: number) => Promise<boolean>;
}

export const VehicleTable = ({
  vehicles,
  loading,
  onApprove,
  onReject,
}: VehicleTableProps) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (vehicles.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg">
        <p className="text-muted-foreground">No vehicles found</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Registration Number</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Tare Weight (kg)</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {vehicles.map((vehicle) => (
            <TableRow key={vehicle.id}>
              <TableCell className="font-medium">{vehicle.id}</TableCell>
              <TableCell className="font-semibold">
                {vehicle.registration_number}
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="capitalize">
                  {vehicle.vehicle_type}
                </Badge>
              </TableCell>
              <TableCell>{vehicle.manufacturer_tare_weight.toFixed(2)}</TableCell>
              <TableCell>
                <StatusBadge status={vehicle.approval_status} />
              </TableCell>
              <TableCell>
                {format(new Date(vehicle.created_at), 'MMM dd, yyyy HH:mm')}
              </TableCell>
              <TableCell className="text-right space-x-2">
                {vehicle.approval_status === 'Pending' && (
                  <>
                    {/* Approve Button */}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="default">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Approve Vehicle</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to approve vehicle{' '}
                            <strong>{vehicle.registration_number}</strong>?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => onApprove(vehicle.id)}
                          >
                            Approve
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>

                    {/* Reject Button */}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="destructive">
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Reject Vehicle</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to reject vehicle{' '}
                            <strong>{vehicle.registration_number}</strong>?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => onReject(vehicle.id)}
                            className="bg-destructive text-destructive-foreground"
                          >
                            Reject
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </>
                )}
                {vehicle.approval_status !== 'Pending' && (
                  <span className="text-sm text-muted-foreground">
                    {vehicle.approval_status === 'Approved'
                      ? 'Approved'
                      : 'Rejected'}
                  </span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};