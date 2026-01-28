import { useState } from 'react';
import { StatsCard } from '@/components/dashboard/widgets/StatsCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSecurityStats } from '@/hooks/useDashboardStats';
import { useVehicles } from '@/hooks/useVehicles';
import { useDrivers, useApproveDriver, useRejectDriver } from '@/hooks/useDrivers';
import { CombinedRegistrationDialog } from '@/components/security/CombinedRegistrationDialog';
import { 
  Car, 
  ShieldCheck, 
  FileSearch, 
  Clock,
  Search,
  CheckCircle,
  XCircle,
  Eye,
  LogIn,
  LogOut,
  RefreshCw,
  Users,
  UserCheck,
  Truck,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function SecurityDashboard() {
  const [poSearch, setPoSearch] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const { isLoading, stats, data, refetch } = useSecurityStats();
  const { vehicles, fetchPendingVehicles, fetchVehicles } = useVehicles();
  const { data: drivers, isLoading: driversLoading, refetch: refetchDrivers } = useDrivers();

  const pendingDrivers = drivers?.filter(d => d.approval_status === 'Pending') || [];
  const pendingVehicles = data.pendingVehicles || [];

  const handleRefreshAll = () => {
    refetch();
    refetchDrivers();
    fetchVehicles();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Security Dashboard</h1>
          <p className="text-muted-foreground">
            Gate operations, vehicle & driver registration, and PO verification
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleRefreshAll} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <CombinedRegistrationDialog onSuccess={handleRefreshAll} />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {isLoading ? (
          <>
            {[...Array(5)].map((_, i) => (
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
              title="Pending Vehicles"
              value={pendingVehicles.length}
              icon={Truck}
              variant="warning"
            />
            <StatsCard
              title="Pending Drivers"
              value={pendingDrivers.length}
              icon={Users}
              variant="warning"
            />
          </>
        )}
      </div>

      {/* Tabs for different management sections */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 bg-muted">
          <TabsTrigger value="overview">Overview</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
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
                    value={poSearch}
                    onChange={(e) => setPoSearch(e.target.value)}
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
            {/* Quick Pending Vehicles */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5" />
                  Pending Vehicles
                </CardTitle>
                <CardDescription>Quick approval actions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoading ? (
                  [...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-16 rounded-lg" />
                  ))
                ) : (
                  <>
                    {pendingVehicles.slice(0, 4).map((vehicle) => (
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
                        </div>
                      </div>
                    ))}
                    {pendingVehicles.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No pending vehicle verifications
                      </p>
                    )}
                    {pendingVehicles.length > 4 && (
                      <Button 
                        variant="link" 
                        className="w-full" 
                        onClick={() => setActiveTab('vehicles')}
                      >
                        View all {pendingVehicles.length} pending vehicles
                      </Button>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            {/* Quick Pending Drivers */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5" />
                  Pending Drivers
                </CardTitle>
                <CardDescription>Quick approval actions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {driversLoading ? (
                  [...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-16 rounded-lg" />
                  ))
                ) : (
                  <>
                    {pendingDrivers.slice(0, 4).map((driver) => (
                      <div
                        key={driver.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Users className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{driver.driver_name}</p>
                            <p className="text-xs text-muted-foreground">
                              {driver.mobile_number} • Aadhaar: ****{driver.aadhaar_encrypted?.slice(-4)}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                        </div>
                      </div>
                    ))}
                    {pendingDrivers.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No pending driver verifications
                      </p>
                    )}
                    {pendingDrivers.length > 4 && (
                      <Button 
                        variant="link" 
                        className="w-full" 
                        onClick={() => setActiveTab('drivers')}
                      >
                        View all {pendingDrivers.length} pending drivers
                      </Button>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Vehicles Tab
        <TabsContent value="vehicles" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                All Pending Vehicles
              </CardTitle>
              <CardDescription>Complete list of vehicles awaiting approval</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16 rounded-lg" />
                ))
              ) : (
                <>
                  {pendingVehicles.map((vehicle) => (
                    <div
                      key={vehicle.id}
                      className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-lg bg-warning/10 flex items-center justify-center">
                          <Car className="h-6 w-6 text-warning" />
                        </div>
                        <div>
                          <p className="font-semibold text-lg">{vehicle.registration_number}</p>
                          <p className="text-sm text-muted-foreground">
                            Type: {vehicle.vehicle_type} • Tare Weight: {vehicle.manufacturer_tare_weight?.toLocaleString() || 'N/A'} kg
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Registered: {formatDistanceToNow(new Date(vehicle.created_at), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                      </div>
                    </div>
                  ))}
                  {pendingVehicles.length === 0 && (
                    <div className="text-center py-8">
                      <Car className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground">No pending vehicle verifications</p>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent> */}

        {/* Drivers Tab */}
        {/* <TabsContent value="drivers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                All Pending Drivers
              </CardTitle>
              <CardDescription>Complete list of drivers awaiting approval</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {driversLoading ? (
                [...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16 rounded-lg" />
                ))
              ) : (
                <>
                  {pendingDrivers.map((driver) => (
                    <div
                      key={driver.id}
                      className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Users className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold text-lg">{driver.driver_name}</p>
                          <p className="text-sm text-muted-foreground">
                            Mobile: {driver.mobile_number}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                      </div>
                    </div>
                  ))}
                  {pendingDrivers.length === 0 && (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground">No pending driver verifications</p>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent> */}

        {/* Active Trips Tab */}
        {/* <TabsContent value="trips" className="space-y-4">
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
                  {data.activeTrips.map((trip) => (
                    <div
                      key={trip.id}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/30 transition-colors border"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                          trip.current_stage === 'EXIT_GATE' ? 'bg-info/10' : 'bg-success/10'
                        }`}>
                          {trip.current_stage === 'EXIT_GATE' ? (
                            <LogOut className="h-5 w-5 text-info" />
                          ) : (
                            <LogIn className="h-5 w-5 text-success" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">Trip #{trip.id} • Vehicle {trip.vehicle_id}</p>
                          <p className="text-sm text-muted-foreground">
                            Stage: {trip.current_stage.replace(/_/g, ' ')} • {formatDistanceToNow(new Date(trip.created_at), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                      <StatusBadge status="active" />
                    </div>
                  ))}
                  {data.activeTrips.length === 0 && (
                    <div className="text-center py-8">
                      <Eye className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground">No active trips</p>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent> */}
      </Tabs>
    </div>
  );
}