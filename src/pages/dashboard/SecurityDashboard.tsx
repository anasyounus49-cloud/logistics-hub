import { useState, useEffect } from 'react';
import { StatsCard } from '@/components/dashboard/widgets/StatsCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useSecurityStats } from '@/hooks/useDashboardStats';
import { useVehicles } from '@/hooks/useVehicles';
import { useDrivers } from '@/hooks/useDrivers';
import { CombinedRegistrationDialog } from '@/components/security/CombinedRegistrationDialog';
import { usePurchaseOrderByReference } from '@/hooks/usePurchaseOrders';
import { useVehicleByRegistration } from '@/hooks/useVehicleRegistration';
import { useCreateTrip, useAdvanceStage } from '@/hooks/useTrips';
import { useVehicleDetection } from '@/hooks/Usevehicledetection';
import { TripCreate, StageUpdate } from '@/api/types/trip.types';
import {
  Car,
  FileSearch,
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
  ImageIcon,
  Loader2,
  Radio,
  WifiOff,
  Wifi,
  AlertCircle,
  AlertTriangle,
  UserPlus,
  CarFront,
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function SecurityDashboard() {
  const [poSearch, setPoSearch] = useState('');
  const [tripDialogOpen, setTripDialogOpen] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');
  const [selectedDriverId, setSelectedDriverId] = useState<string>('');
  const [detectedPlateNumber, setDetectedPlateNumber] = useState<string>('');
  const [registrationDialogOpen, setRegistrationDialogOpen] = useState(false);
  const [registrationMode, setRegistrationMode] = useState<'vehicle' | 'driver' | 'both'>('both');

  const { isLoading, stats, data, refetch } = useSecurityStats();
  const { vehicles, fetchVehicles } = useVehicles();
  const { data: drivers, isLoading: driversLoading, refetch: refetchDrivers } = useDrivers();
  const createTripMutation = useCreateTrip();
  const advanceStageMutation = useAdvanceStage();

  // WebSocket for live vehicle detection
  const {
    data: detectionData,
    isConnected: wsConnected,
    error: wsError,
    reconnect: wsReconnect,
    clearData: clearDetection,
  } = useVehicleDetection({
    url: 'ws://10.3.6.14:8001/ws',
    autoConnect: true,
    reconnectInterval: 3000,
  });

  // Check vehicle registration when plate is detected
  const {
    data: vehicleRegData,
    isLoading: isCheckingRegistration,
    isError: isNotRegistered,
    error: regError,
  } = useVehicleByRegistration(detectedPlateNumber);

  // Update detected plate number when WebSocket receives data
  useEffect(() => {
    if (detectionData?.plate) {
      setDetectedPlateNumber(detectionData.plate);
    }
  }, [detectionData?.plate]);

  // PO Verification
  const isReferenceId = /^PO[-_\s]?\d+$/i.test(poSearch.trim());
  const {
    data: poData,
    isLoading: poLoading,
    isError: poError,
  } = usePurchaseOrderByReference(isReferenceId ? poSearch.trim() : undefined);

  const pendingDrivers = drivers?.filter((d) => d.approval_status === 'Pending') || [];
  const pendingVehicles = data?.pendingVehicles || [];

  // Filter approved vehicles and drivers for trip creation
  const approvedVehicles = vehicles?.filter((v) => v.approval_status === 'Approved') || [];
  const approvedDrivers = drivers?.filter((d) => d.approval_status === 'Approved') || [];

  const handleRefreshAll = () => {
    refetch();
    refetchDrivers();
    fetchVehicles();
  };

  const handleOpenRegistrationDialog = (mode: 'vehicle' | 'driver' | 'both') => {
    setRegistrationMode(mode);
    setRegistrationDialogOpen(true);
  };

  const handleOpenTripDialog = () => {
    if (!poData || !vehicleRegData || vehicleRegData.approval_status !== 'Approved') {
      return;
    }
    setSelectedVehicleId(vehicleRegData.id.toString());
    setSelectedDriverId('');
    setTripDialogOpen(true);
  };

  const handleCreateTrip = async () => {
    if (!poData || !selectedVehicleId || !selectedDriverId) {
      return;
    }

    const tripData: TripCreate = {
      vehicle_id: parseInt(selectedVehicleId),
      driver_id: parseInt(selectedDriverId),
      po_id: poData.id,
    };

    try {
      const createdTrip = await createTripMutation.mutateAsync(tripData);

      const stageUpdate: StageUpdate = {
        next_stage: 'GROSS_WEIGHT',
        remarks: 'Vehicle entry at security gate',
      };

      await advanceStageMutation.mutateAsync({
        tripId: createdTrip.id,
        data: stageUpdate,
      });

      setTripDialogOpen(false);
      setSelectedVehicleId('');
      setSelectedDriverId('');
      setPoSearch('');
      setDetectedPlateNumber('');
      clearDetection();
    } catch (error) {
      console.error('Error creating trip:', error);
    }
  };

  const handleViewAllVehicles = () => {
    console.log('View all pending vehicles');
  };

  const handleViewAllDrivers = () => {
    console.log('View all pending drivers');
  };

  const isCreatingTrip = createTripMutation.isPending || advanceStageMutation.isPending;

  // Determine registration status UI
  const getRegistrationStatusUI = () => {
    if (!detectedPlateNumber) {
      return null;
    }

    if (isCheckingRegistration) {
      return (
        <Alert className="border-blue-200 bg-blue-50">
          <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
          <AlertDescription className="text-blue-700 ml-2">
            Checking vehicle registration...
          </AlertDescription>
        </Alert>
      );
    }

    if (isNotRegistered || !vehicleRegData) {
      return (
        <Alert className="border-amber-200 bg-amber-50">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-700 ml-2 space-y-2">
            <p className="font-semibold">Vehicle Not Registered</p>
            <p className="text-sm">
              Registration Number: <span className="font-mono font-bold">{detectedPlateNumber}</span>
            </p>
            <Button
              onClick={() => handleOpenRegistrationDialog('both')}
              size="sm"
              className="mt-2"
            >
              <CarFront className="mr-2 h-4 w-4" />
              Register Vehicle Now
            </Button>
          </AlertDescription>
        </Alert>
      );
    }

    if (vehicleRegData.approval_status === 'Rejected') {
      return (
        <Alert className="border-red-200 bg-red-50">
          <XCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-700 ml-2">
            <p className="font-semibold">Vehicle Registration Rejected</p>
            <p className="text-sm mt-1">
              Please contact higher authority for vehicle: {detectedPlateNumber}
            </p>
          </AlertDescription>
        </Alert>
      );
    }

    if (vehicleRegData.approval_status === 'Pending') {
      return (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertCircle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-700 ml-2">
            <p className="font-semibold">Vehicle Registration Pending Approval</p>
            <p className="text-sm mt-1">
              Registration Number: <span className="font-mono">{detectedPlateNumber}</span>
            </p>
            <Button
              onClick={() => handleOpenRegistrationDialog('driver')}
              size="sm"
              variant="outline"
              className="mt-2"
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Register Driver
            </Button>
          </AlertDescription>
        </Alert>
      );
    }

    if (vehicleRegData.approval_status === 'Approved') {
      return (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-700 ml-2">
            <p className="font-semibold">✓ Vehicle Registered</p>
            <p className="text-sm mt-1">
              {vehicleRegData.registration_number} - {vehicleRegData.vehicle_type}
            </p>
            <Button
              onClick={() => handleOpenRegistrationDialog('driver')}
              size="sm"
              variant="outline"
              className="mt-2"
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Register Driver
            </Button>
          </AlertDescription>
        </Alert>
      );
    }

    return null;
  };

  // Check if can create trip
  const canCreateTrip =
    vehicleRegData?.approval_status === 'Approved' && poData && !isCreatingTrip;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Security Dashboard</h1>
          <p className="text-muted-foreground">
            Gate operations, vehicle & driver registration, and PO verification
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant={wsConnected ? 'default' : 'destructive'} className="flex items-center gap-1.5">
            {wsConnected ? (
              <>
                <Wifi className="h-3 w-3" />
                Live Detection Active
              </>
            ) : (
              <>
                <WifiOff className="h-3 w-3" />
                Disconnected
              </>
            )}
          </Badge>

          {!wsConnected && (
            <Button onClick={wsReconnect} variant="outline" size="sm">
              <RefreshCw className="mr-2 h-4 w-4" />
              Reconnect
            </Button>
          )}

          <Button onClick={handleRefreshAll} variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* WebSocket Error Alert */}
      {wsError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="ml-2">
            {wsError}
            <Button onClick={wsReconnect} variant="ghost" size="sm" className="ml-auto">
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {isLoading ? (
          <>
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </>
        ) : (
          <>
            <StatsCard
              title="Today's Entries"
              value={stats?.gateEntries || 0}
              icon={LogIn}
              description="Vehicles entered today"
            />
            <StatsCard
              title="Today's Exits"
              value={stats?.gateExits || 0}
              icon={LogOut}
              description="Vehicles exited today"
            />
            <StatsCard
              title="Vehicles Today"
              value={stats?.vehiclesToday || 0}
              icon={Truck}
              description="Total vehicles today"
            />
            <StatsCard
              title="Pending Drivers"
              value={pendingDrivers.length}
              icon={UserCheck}
              description="Awaiting verification"
            />
            <StatsCard
              title="Pending Vehicles"
              value={pendingVehicles.length}
              icon={Car}
              description="Awaiting verification"
            />
          </>
        )}
      </div>

      {/* Main Content - Vehicle Image & PO Verification */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Left Side - Vehicle Image */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                <CardTitle>Vehicle Image</CardTitle>
              </div>
              <Badge variant={wsConnected ? 'default' : 'secondary'} className="flex items-center gap-1">
                <Radio className={`h-3 w-3 ${wsConnected ? 'animate-pulse' : ''}`} />
                {wsConnected ? 'Live' : 'Offline'}
              </Badge>
            </div>
            <CardDescription>Vehicle photo capture</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Vehicle Image Display */}
            <div className="aspect-video bg-muted rounded-lg flex items-center justify-center overflow-hidden relative">
              {detectionData?.image ? (
                <img
                  src={`data:image/jpeg;base64,${detectionData.image}`}
                  alt="Detected Vehicle"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center text-muted-foreground">
                  <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p className="font-medium">Vehicle Image</p>
                  <p className="text-sm">Image will load here</p>
                </div>
              )}
            </div>

            {/* Registration Status Alert */}
            {getRegistrationStatusUI()}
          </CardContent>
        </Card>

        {/* Right Side - PO Verification */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSearch className="h-5 w-5" />
              PO Verification
            </CardTitle>
            <CardDescription>Verify purchase order before vehicle entry</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Enter PO reference (e.g., PO-1234)"
                value={poSearch}
                onChange={(e) => setPoSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && isReferenceId && !poLoading) {
                    e.preventDefault();
                  }
                }}
              />
              <Button disabled={!isReferenceId || poLoading}>
                {poLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              </Button>
            </div>

            {/* PO Result */}
            {poLoading && (
              <div className="p-4 border border-blue-200 bg-blue-50 rounded-lg text-center">
                <p className="text-sm text-blue-700">Verifying PO… ⏳</p>
                <Skeleton className="h-4 w-full mt-2" />
              </div>
            )}

            {poError && (
              <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
                <div className="flex items-start gap-3">
                  <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-red-900">Invalid PO</p>
                    <p className="text-sm text-red-700">No active purchase order found for this reference</p>
                  </div>
                </div>
              </div>
            )}

            {poData && (
              <div className="p-4 border border-green-200 bg-green-50 rounded-lg space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold text-green-900">✓ PO Verified</p>
                    <p className="text-sm font-mono text-green-800">{poData.po_reference_number}</p>
                    <p className="text-sm text-green-700 mt-1">
                      Seller: {poData.seller_name}, Valid Until: {poData.validity_end_date}
                    </p>
                  </div>
                </div>
                <Button
                  onClick={handleOpenTripDialog}
                  className="w-full"
                  size="sm"
                  disabled={!canCreateTrip}
                >
                  {isCreatingTrip ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Trip...
                    </>
                  ) : !vehicleRegData || vehicleRegData.approval_status !== 'Approved' ? (
                    'Vehicle Must Be Approved First'
                  ) : (
                    'Create Trip'
                  )}
                </Button>
              </div>
            )}

            {/* Vehicle Detection Info - Show only when registered */}
            {detectionData && vehicleRegData && (
              <div className="space-y-1 text-sm border-t pt-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Vehicle type :</span>
                  <span className="font-medium">{detectionData.vehicle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fast tag id:</span>
                  <span className="font-medium">{detectionData.fastag || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">manufacturer tare weight:</span>
                  <span className="font-medium">
                    {vehicleRegData.manufacturer_tare_weight?.toLocaleString() || 'N/A'} kg
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Register Vehicle & Driver Button - Full Width */}
      <Card>
        <CardContent className="p-6">
          <CombinedRegistrationDialog
            detectedData={
              detectionData
                ? {
                    registrationNumber: detectionData.plate,
                    fastagId: detectionData.fastag,
                    vehicleType: detectionData.vehicle,
                    vehicleImage: detectionData.image,
                  }
                : undefined
            }
            vehicleData={
              vehicleRegData && vehicleRegData.approval_status === 'Approved'
                ? vehicleRegData
                : undefined
            }
            mode={registrationMode}
            open={registrationDialogOpen}
            onOpenChange={setRegistrationDialogOpen}
          />
        </CardContent>
      </Card>

      {/* Bottom Row - Pending Approvals */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Pending Vehicles */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="h-5 w-5" />
              Pending Vehicles
            </CardTitle>
            <CardDescription>Awaiting approval</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-16" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {pendingVehicles.slice(0, 4).map((vehicle) => (
                  <div
                    key={vehicle.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{vehicle.registration_number}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {vehicle.vehicle_type} • Tare: {vehicle.manufacturer_tare_weight?.toLocaleString() || 'N/A'} kg
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" className="flex-shrink-0">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                ))}

                {pendingVehicles.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Car className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No pending vehicle verifications</p>
                  </div>
                )}

                {pendingVehicles.length > 4 && (
                  <Button onClick={handleViewAllVehicles} variant="outline" className="w-full mt-3" size="sm">
                    View all {pendingVehicles.length} pending vehicles
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pending Drivers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Pending Drivers
            </CardTitle>
            <CardDescription>Awaiting approval</CardDescription>
          </CardHeader>
          <CardContent>
            {driversLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-16" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {pendingDrivers.slice(0, 4).map((driver) => (
                  <div
                    key={driver.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{driver.driver_name}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {driver.mobile_number} • Aadhaar: ****{driver.aadhaar?.slice(-4)}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" className="flex-shrink-0">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                ))}

                {pendingDrivers.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No pending driver verifications</p>
                  </div>
                )}

                {pendingDrivers.length > 4 && (
                  <Button onClick={handleViewAllDrivers} variant="outline" className="w-full mt-3" size="sm">
                    View all {pendingDrivers.length} pending drivers
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create Trip Dialog */}
      <Dialog open={tripDialogOpen} onOpenChange={setTripDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Trip</DialogTitle>
            <DialogDescription>Select vehicle and driver for PO: {poData?.po_reference_number}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* PO Info */}
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium">Purchase Order Details</p>
              <p className="text-sm text-muted-foreground mt-1">Seller: {poData?.seller_name}</p>
              <p className="text-sm text-muted-foreground">Valid until: {poData?.validity_end_date}</p>
            </div>

            {/* Pre-selected Vehicle */}
            {vehicleRegData && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm font-medium text-green-900">Selected Vehicle</p>
                <p className="text-sm text-green-700 mt-1">
                  {vehicleRegData.registration_number} - {vehicleRegData.vehicle_type}
                </p>
              </div>
            )}

            {/* Driver Selection */}
            <div className="space-y-2">
              <Label htmlFor="driver">Select Driver *</Label>
              <Select value={selectedDriverId} onValueChange={setSelectedDriverId}>
                <SelectTrigger id="driver">
                  <SelectValue placeholder="Choose a driver" />
                </SelectTrigger>
                <SelectContent>
                  {approvedDrivers.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground text-center">No approved drivers available</div>
                  ) : (
                    approvedDrivers.map((driver) => (
                      <SelectItem key={driver.id} value={driver.id.toString()}>
                        {driver.driver_name} - {driver.mobile_number}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setTripDialogOpen(false)}
              className="flex-1"
              disabled={isCreatingTrip}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateTrip} className="flex-1" disabled={!selectedDriverId || isCreatingTrip}>
              {isCreatingTrip ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Trip & Enter'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}