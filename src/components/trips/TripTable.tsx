import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { EnrichedTrip } from '@/hooks/useTrips';
import { TripStage } from '@/api/types/common.types';
import { StatusBadge } from '@/components/common/StatusBadge';
import { TripStageProgress } from '@/components/common/TripStageProgress';
import { MoreHorizontal, Eye, ArrowRight, Truck, User } from 'lucide-react';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

interface TripTableProps {
  trips: EnrichedTrip[];
  isLoading: boolean;
  onViewDetails: (trip: EnrichedTrip) => void;
  onAdvanceStage: (trip: EnrichedTrip) => void;
}

export function TripTable({
  trips,
  isLoading,
  onViewDetails,
  onAdvanceStage,
}: TripTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (trips.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="text-lg">No trips found</p>
        <p className="text-sm">Trips will appear here once created</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Trip ID</TableHead>
            <TableHead>Vehicle</TableHead>
            <TableHead>Driver</TableHead>
            <TableHead>Purchase Order</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Current Stage</TableHead>
            <TableHead>Weights</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {trips.map((trip) => (
            <TableRow key={trip.id}>
              <TableCell className="font-medium">
                <Badge variant="outline" className="font-mono">
                  TRP-{trip.id.toString().padStart(4, '0')}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">
                      {trip.vehicle_registration || `VEH-${trip.vehicle_id}`}
                    </p>
                    {trip.vehicle_type && (
                      <p className="text-xs text-muted-foreground">{trip.vehicle_type}</p>
                    )}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">
                      {trip.driver_name || `DRV-${trip.driver_id}`}
                    </p>
                    {trip.driver_mobile && (
                      <p className="text-xs text-muted-foreground">{trip.driver_mobile}</p>
                    )}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div>
                  <p className="font-medium">
                    {trip.po_reference || `PO-${trip.po_id}`}
                  </p>
                  {trip.seller_name && (
                    <p className="text-xs text-muted-foreground">{trip.seller_name}</p>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <StatusBadge status={trip.status.toLowerCase()} />
              </TableCell>
              <TableCell>
                <TripStageProgress 
                  currentStage={trip.current_stage as TripStage}
                  isCompleted={trip.status === 'COMPLETED'}
                />
              </TableCell>
              <TableCell>
                <div className="text-sm">
                  <div>Gross: {trip.gross_weight ? `${trip.gross_weight.toLocaleString()} kg` : '—'}</div>
                  <div className="text-muted-foreground">
                    Tare: {trip.tare_weight ? `${trip.tare_weight.toLocaleString()} kg` : '—'}
                  </div>
                  {trip.gross_weight && trip.tare_weight && (
                    <div className="text-primary font-medium">
                      Net: {(trip.gross_weight - trip.tare_weight).toLocaleString()} kg
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                {format(new Date(trip.created_at), 'MMM d, HH:mm')}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onViewDetails(trip)}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                    {trip.status === 'ACTIVE' && trip.current_stage !== 'EXIT_GATE' && (
                      <DropdownMenuItem onClick={() => onAdvanceStage(trip)}>
                        <ArrowRight className="h-4 w-4 mr-2" />
                        Advance Stage
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}