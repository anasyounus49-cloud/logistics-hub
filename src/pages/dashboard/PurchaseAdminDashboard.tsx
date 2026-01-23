import { StatsCard } from '@/components/dashboard/widgets/StatsCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusBadge } from '@/components/common/StatusBadge';
import { TripStageProgress } from '@/components/common/TripStageProgress';
import { usePurchaseAdminStats } from '@/hooks/useDashboardStats';
import { useApproveDriver, useRejectDriver } from '@/hooks/useDrivers';
import { useVehicles } from '@/hooks/useVehicles';
import { 
  FileText, 
  Package, 
  Truck, 
  Car,
  Route,
  Clock,
  CheckCircle,
  XCircle,
  Plus,
  RefreshCw,
} from 'lucide-react';
import { TripStage } from '@/api/types/common.types';

export default function PurchaseAdminDashboard() {
  const { isLoading, stats, data, refetch } = usePurchaseAdminStats();
  const approveDriverMutation = useApproveDriver();
  const rejectDriverMutation = useRejectDriver();
  const { approveVehicle, rejectVehicle } = useVehicles();

  const handleApproveDriver = (id: number) => {
    approveDriverMutation.mutate(id);
  };

  const handleRejectDriver = (id: number) => {
    rejectDriverMutation.mutate(id);
  };

  const handleApproveVehicle = async (id: number) => {
    await approveVehicle(id);
    refetch();
  };

  const handleRejectVehicle = async (id: number) => {
    await rejectVehicle(id);
    refetch();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Purchase Dashboard</h1>
          <p className="text-muted-foreground">
            Manage purchase orders, approvals, and trip monitoring
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Create PO
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
          <>
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))}
          </>
        ) : (
          <>
            <StatsCard
              title="Active POs"
              value={stats.activePOs}
              icon={FileText}
              variant="primary"
            />
            <StatsCard
              title="Pending Drivers"
              value={stats.pendingDrivers}
              icon={Truck}
              variant="warning"
            />
            <StatsCard
              title="Pending Vehicles"
              value={stats.pendingVehicles}
              icon={Car}
              variant="warning"
            />
            <StatsCard
              title="Active Trips"
              value={stats.activeTrips}
              icon={Route}
              variant="info"
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Approvals */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Pending Approvals
            </CardTitle>
            <CardDescription>Drivers and vehicles awaiting approval</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              [...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-16 rounded-lg" />
              ))
            ) : (
              <>
                {data.pendingDrivers.slice(0, 3).map((driver) => (
                  <div
                    key={driver.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center">
                        <Truck className="h-5 w-5 text-warning" />
                      </div>
                      <div>
                        <p className="font-medium">{driver.driver_name}</p>
                        <p className="text-xs text-muted-foreground">
                          Driver • {driver.mobile_number}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="text-success hover:text-success hover:bg-success/10"
                        onClick={() => handleApproveDriver(driver.id)}
                        disabled={approveDriverMutation.isPending}
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleRejectDriver(driver.id)}
                        disabled={rejectDriverMutation.isPending}
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {data.pendingVehicles.slice(0, 2).map((vehicle) => (
                  <div
                    key={vehicle.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center">
                        <Car className="h-5 w-5 text-warning" />
                      </div>
                      <div>
                        <p className="font-medium">{vehicle.registration_number}</p>
                        <p className="text-xs text-muted-foreground">
                          Vehicle • Tare: {vehicle.manufacturer_tare_weight?.toLocaleString() || 'N/A'} kg
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="text-success hover:text-success hover:bg-success/10"
                        onClick={() => handleApproveVehicle(vehicle.id)}
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleRejectVehicle(vehicle.id)}
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {data.pendingDrivers.length === 0 && data.pendingVehicles.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No pending approvals
                  </p>
                )}
              </>
            )}
            <Button variant="outline" className="w-full">
              View All Approvals
            </Button>
          </CardContent>
        </Card>

        {/* Active Trips */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Route className="h-5 w-5" />
              Active Trip Monitoring
            </CardTitle>
            <CardDescription>Real-time trip status tracking</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              [...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-24 rounded-lg" />
              ))
            ) : (
              <>
                {data.activeTrips.slice(0, 4).map((trip) => (
                  <div key={trip.id} className="p-4 rounded-lg bg-muted/30 border space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Trip #{trip.id}</p>
                        <p className="text-xs text-muted-foreground">
                          Vehicle: {trip.vehicle_id} • PO: {trip.po_id}
                        </p>
                      </div>
                      <StatusBadge status="active" />
                    </div>
                    <TripStageProgress currentStage={trip.current_stage as TripStage} />
                  </div>
                ))}
                {data.activeTrips.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No active trips
                  </p>
                )}
              </>
            )}
            <Button variant="outline" className="w-full">
              View All Trips
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent POs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Recent Purchase Orders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {isLoading ? (
              [...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-16 rounded-lg" />
              ))
            ) : (
              <>
                {data.activePOs.slice(0, 5).map((po) => (
                  <div
                    key={po.id}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Package className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{po.po_reference_number}</p>
                        <p className="text-xs text-muted-foreground">
                          {po.seller_name}
                        </p>
                      </div>
                    </div>
                    <StatusBadge status={po.status.toLowerCase() as any} />
                  </div>
                ))}
                {data.activePOs.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No active purchase orders
                  </p>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
