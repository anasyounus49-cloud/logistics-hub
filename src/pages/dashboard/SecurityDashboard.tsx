import { StatsCard } from '@/components/dashboard/widgets/StatsCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusBadge } from '@/components/common/StatusBadge';
import { useSecurityStats } from '@/hooks/useDashboardStats';
import { useVehicles } from '@/hooks/useVehicles';
import { 
  Car, 
  ShieldCheck, 
  FileSearch, 
  Clock,
  Search,
  CheckCircle,
  XCircle,
  Eye,
  Plus,
  LogIn,
  LogOut,
  RefreshCw,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function SecurityDashboard() {
  const { isLoading, stats, data, refetch } = useSecurityStats();
  const { approveVehicle, rejectVehicle } = useVehicles();

  const handleApprove = async (id: number) => {
    await approveVehicle(id);
    refetch();
  };

  const handleReject = async (id: number) => {
    await rejectVehicle(id);
    refetch();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Security Dashboard</h1>
          <p className="text-muted-foreground">
            Gate operations, vehicle registration, and PO verification
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Register Vehicle
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
              title="Vehicles Today"
              value={stats.vehiclesToday}
              icon={Car}
              variant="primary"
            />
            <StatsCard
              title="Gate Entries"
              value={stats.gateEntries}
              icon={LogIn}
              variant="success"
            />
            <StatsCard
              title="Gate Exits"
              value={stats.gateExits}
              icon={LogOut}
              variant="info"
            />
            <StatsCard
              title="Pending Verification"
              value={stats.pendingVerification}
              icon={Clock}
              variant="warning"
            />
          </>
        )}
      </div>

      {/* PO Verification Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSearch className="h-5 w-5" />
            PO Verification
          </CardTitle>
          <CardDescription>Verify purchase order before vehicle entry</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Enter PO reference number (e.g., PO-2024-0155)"
                className="pl-10"
              />
            </div>
            <Button>Verify PO</Button>
          </div>

          {/* Mock verified PO */}
          <div className="p-4 rounded-lg border bg-success/5 border-success/20">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-success" />
                  <span className="font-semibold text-success">PO Verified</span>
                </div>
                <p className="font-medium">PO-2024-0155</p>
                <p className="text-sm text-muted-foreground">
                  Seller: Steel Corp Ltd • Material: Iron Ore
                </p>
                <p className="text-sm text-muted-foreground">
                  Valid until: 31 Jan 2026 • Remaining qty: 450 MT
                </p>
              </div>
              <Button size="sm">Create Trip</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Vehicle Verifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5" />
              Pending Verifications
            </CardTitle>
            <CardDescription>Vehicles awaiting approval</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              [...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-16 rounded-lg" />
              ))
            ) : (
              <>
                {data.pendingVehicles.slice(0, 5).map((vehicle) => (
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
                          {vehicle.vehicle_type} • Tare: {vehicle.manufacturer_tare_weight?.toLocaleString() || 'N/A'} kg
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="text-success hover:text-success hover:bg-success/10"
                        onClick={() => handleApprove(vehicle.id)}
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleReject(vehicle.id)}
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {data.pendingVehicles.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No pending verifications
                  </p>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Recent Vehicles */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Active Trips
            </CardTitle>
            <CardDescription>Current vehicles in system</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-14 rounded-lg" />
              ))
            ) : (
              <>
                {data.activeTrips.slice(0, 6).map((trip) => (
                  <div
                    key={trip.id}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                        trip.current_stage === 'EXIT_GATE' ? 'bg-info/10' : 'bg-success/10'
                      }`}>
                        {trip.current_stage === 'EXIT_GATE' ? (
                          <LogOut className="h-4 w-4 text-info" />
                        ) : (
                          <LogIn className="h-4 w-4 text-success" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-sm">Trip #{trip.id} • Vehicle {trip.vehicle_id}</p>
                        <p className="text-xs text-muted-foreground">
                          Stage: {trip.current_stage.replace('_', ' ')} • {formatDistanceToNow(new Date(trip.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                    <StatusBadge status="active" />
                  </div>
                ))}
                {data.activeTrips.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No active trips
                  </p>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
