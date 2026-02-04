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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { useSecurityStats } from '@/hooks/useDashboardStats';
import { useVehicles } from '@/hooks/useVehicles';
import { useDrivers, useDriver } from '@/hooks/useDrivers';
import { CombinedRegistrationDialog } from '@/components/security/CombinedRegistrationDialog';
import { DriverSelectionDialog } from '@/components/security/DriverSelectionDialog';
import { usePurchaseOrderByReference } from '@/hooks/usePurchaseOrders';
import { useCreateTrip, useAdvanceStage } from '@/hooks/useTrips';
import { useVehicleDetection } from '@/hooks/Usevehicledetection';
import { useVehicleByRegistration } from '@/hooks/useVehicleRegistration';
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
  Image as ImageIcon,
  Loader2,
  Radio,
  WifiOff,
  Wifi,
  AlertCircle,
  ShieldCheck,
  Clock,
  Ban,
  Plus,
  ScanLine,
  HelpCircle,
  UserCircle,
} from 'lucide-react';

export default function SecurityDashboard() {
  const [poSearch, setPoSearch] = useState('');
  const [tripDialogOpen, setTripDialogOpen] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');
  const [selectedDriverId, setSelectedDriverId] = useState<string>('');
  const [driverSelectionDialogOpen, setDriverSelectionDialogOpen] = useState(false);
  const [selectedDriverPhone, setSelectedDriverPhone] = useState<string>('');
  
  // Track newly registered driver info
  const [newlyRegisteredDriverId, setNewlyRegisteredDriverId] = useState<number | null>(null);
  const [newlyRegisteredDriverPhone, setNewlyRegisteredDriverPhone] = useState<string | null>(null);
  
  const { isLoading, stats, data, refetch } = useSecurityStats();
  const { vehicles, fetchVehicles } = useVehicles();
  const { data: drivers, isLoading: driversLoading, refetch: refetchDrivers } = useDrivers();
  const createTripMutation = useCreateTrip();
  const advanceStageMutation = useAdvanceStage();

  // Fetch selected driver details
  const { data: selectedDriver } = useDriver(selectedDriverId ? parseInt(selectedDriverId) : 0);

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

  // Check if detected vehicle is already registered
  const {
    data: existingVehicle,
    isLoading: vehicleCheckLoading,
    isError: vehicleCheckError,
    refetch: refetchVehicleStatus,
  } = useVehicleByRegistration(detectionData?.plate);

  const isReferenceId = /^PO[-_\s]?\d+$/i.test(poSearch.trim());
  const {
    data: poData,
    isLoading: poLoading,
    isError: poError,
  } = usePurchaseOrderByReference(
    isReferenceId ? poSearch.trim() : undefined
  );

  // Determine vehicle registration status
  const getVehicleStatus = () => {
    if (!detectionData?.plate) return null;
    if (vehicleCheckLoading) return 'checking';
    if (vehicleCheckError || !existingVehicle) return 'not_registered';
    return existingVehicle.approval_status; // 'Pending', 'Approved', 'Rejected'
  };

  const vehicleStatus = getVehicleStatus();

  const pendingDrivers = drivers?.filter(d => d.approval_status === 'Pending') || [];
  const pendingVehicles = data?.pendingVehicles || [];
  
  // Filter approved vehicles and drivers for trip creation
  const approvedVehicles = vehicles?.filter((v) => v.approval_status === 'Approved') || [];
  const approvedDrivers = drivers?.filter((d) => d.approval_status === 'Approved') || [];

  // Auto-fill vehicle when detected and approved
  useEffect(() => {
    if (tripDialogOpen && existingVehicle && vehicleStatus === 'Approved') {
      setSelectedVehicleId(existingVehicle.id.toString());
    }
  }, [tripDialogOpen, existingVehicle, vehicleStatus]);

  // Auto-fill driver based on newly registered or phone search
  useEffect(() => {
    if (!tripDialogOpen) return;

    // Priority 1: Use newly registered driver ID
    if (newlyRegisteredDriverId) {
      const driver = approvedDrivers.find(d => d.id === newlyRegisteredDriverId);
      if (driver) {
        setSelectedDriverId(driver.id.toString());
        return;
      }
    }

    // Priority 2: Search by phone number
    if (newlyRegisteredDriverPhone) {
      const driver = approvedDrivers.find(d => d.mobile_number === newlyRegisteredDriverPhone);
      if (driver) {
        setSelectedDriverId(driver.id.toString());
        return;
      }
    }
  }, [tripDialogOpen, newlyRegisteredDriverId, newlyRegisteredDriverPhone, approvedDrivers]);

  const handleRefreshAll = () => {
    refetch();
    refetchDrivers();
    fetchVehicles();
  };

  const handleOpenTripDialog = () => {
    if (!poData) return;
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
      // Create the trip
      const createdTrip = await createTripMutation.mutateAsync(tripData);

      // Advance stage to GROSS_WEIGHT
      const stageUpdate: StageUpdate = {
        next_stage: 'GROSS_WEIGHT',
        remarks: 'Vehicle entry at security gate',
      };

      await advanceStageMutation.mutateAsync({
        tripId: createdTrip.id,
        data: stageUpdate,
      });

      // Reset form and close dialog
      setTripDialogOpen(false);
      setSelectedVehicleId('');
      setSelectedDriverId('');
      setPoSearch('');
      setNewlyRegisteredDriverId(null);
      setNewlyRegisteredDriverPhone(null);
      clearDetection();
    } catch (error) {
      console.error('Error creating trip:', error);
    }
  };

  const handleRegistrationSuccess = (data: { vehicleId?: number; driverId?: number; driverPhone?: string }) => {
    // Store driver info for auto-fill
    if (data.driverId) {
      setNewlyRegisteredDriverId(data.driverId);
      setSelectedDriverId(data.driverId.toString());
    }
    if (data.driverPhone) {
      setNewlyRegisteredDriverPhone(data.driverPhone);
      setSelectedDriverPhone(data.driverPhone);
    }

    // Refresh data
    fetchVehicles();
    refetchDrivers();
    refetch();
  };

  const handleDriverSelected = (driverId: number, driverPhone: string) => {
    setSelectedDriverId(driverId.toString());
    setSelectedDriverPhone(driverPhone);
    setNewlyRegisteredDriverId(driverId);
    setNewlyRegisteredDriverPhone(driverPhone);
  };

  const handleViewAllVehicles = () => {
    // TODO: Navigate to vehicles page or open modal
    console.log('View all pending vehicles');
  };

  const handleViewAllDrivers = () => {
    // TODO: Navigate to drivers page or open modal
    console.log('View all pending drivers');
  };

  const isCreatingTrip = createTripMutation.isPending || advanceStageMutation.isPending;

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
          {/* WebSocket Status Badge */}
          <Badge 
            variant={wsConnected ? "default" : "destructive"}
            className="flex items-center gap-1.5"
          >
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
          
          {/* Reconnect button if disconnected */}
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
        <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
          <AlertCircle className="h-4 w-4 text-destructive" />
          <p className="text-sm text-destructive">{wsError}</p>
          <Button 
            onClick={wsReconnect} 
            variant="ghost" 
            size="sm" 
            className="ml-auto"
          >
            Retry
          </Button>
        </div>
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

      {/* Top Row - Vehicle Detection & PO Verification + Register Button */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Live Vehicle Detection Card */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                <CardTitle>Live Vehicle Detection</CardTitle>
              </div>
              <Badge 
                variant={wsConnected ? "default" : "secondary"}
                className="flex items-center gap-1"
              >
                <Radio className={`h-3 w-3 ${wsConnected ? 'animate-pulse' : ''}`} />
                {wsConnected ? 'Live' : 'Offline'}
              </Badge>
            </div>
            <CardDescription>Real-time plate recognition from camera</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* L-Shape Layout: Image left, Details right */}
            <div className="flex gap-4">
              {/* Left side - Vehicle Image (larger) */}
              <div className="w-2/3 aspect-[4/3] bg-muted rounded-lg flex items-center justify-center overflow-hidden relative">
                {detectionData?.image ? (
                  <img 
                    src={`data:image/jpeg;base64,${detectionData.image}`} 
                    alt="Detected Vehicle"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center text-muted-foreground">
                    <ImageIcon className="h-10 w-10 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Waiting for detection...</p>
                  </div>
                )}
              </div>

              {/* Right side - Detection Details */}
              <div className="w-1/3 flex flex-col gap-3">
                {/* Registration Status Badge */}
                <div className="p-3 rounded-lg bg-muted/50 border">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs text-muted-foreground">Status</p>
                    <div className="flex items-center gap-1">
                      {/* Reload button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-5 w-5 p-0"
                        onClick={() => {
                          if (detectionData?.plate) {
                            // Refetch the specific vehicle registration status
                            refetchVehicleStatus();
                          }
                        }}
                        disabled={!detectionData?.plate || vehicleCheckLoading}
                        title="Refresh vehicle status"
                      >
                        <RefreshCw className={`h-3 w-3 ${vehicleCheckLoading ? 'animate-spin' : ''}`} />
                      </Button>
                      
                      {/* Help popover */}
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-5 w-5 p-0"
                          >
                            <HelpCircle className="h-3 w-3 text-muted-foreground" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-64 text-xs" align="end">
                          <div className="space-y-2">
                            <p className="font-semibold">Vehicle Status Guide:</p>
                            <div className="space-y-1.5">
                              <div className="flex items-start gap-2">
                                <ShieldCheck className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                                <span><strong>Registered:</strong> Vehicle is approved and ready for trips</span>
                              </div>
                              <div className="flex items-start gap-2">
                                <Clock className="h-3 w-3 text-amber-600 mt-0.5 flex-shrink-0" />
                                <span><strong>Pending:</strong> Awaiting admin approval</span>
                              </div>
                              <div className="flex items-start gap-2">
                                <Ban className="h-3 w-3 text-red-600 mt-0.5 flex-shrink-0" />
                                <span><strong>Rejected:</strong> Contact admin to resolve</span>
                              </div>
                              <div className="flex items-start gap-2">
                                <AlertCircle className="h-3 w-3 text-orange-600 mt-0.5 flex-shrink-0" />
                                <span><strong>Not Registered:</strong> Vehicle needs registration</span>
                              </div>
                            </div>
                            <p className="text-muted-foreground pt-1">
                              Click the reload icon to refresh the status.
                            </p>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                  {vehicleStatus === 'checking' ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      <span className="text-sm">Checking...</span>
                    </div>
                  ) : vehicleStatus === 'Approved' ? (
                    <Badge className="bg-green-500 hover:bg-green-600 gap-1">
                      <ShieldCheck className="h-3 w-3" />
                      Registered
                    </Badge>
                  ) : vehicleStatus === 'Pending' ? (
                    <Badge variant="secondary" className="gap-1">
                      <Clock className="h-3 w-3" />
                      Pending
                    </Badge>
                  ) : vehicleStatus === 'Rejected' ? (
                    <Badge variant="destructive" className="gap-1">
                      <Ban className="h-3 w-3" />
                      Rejected
                    </Badge>
                  ) : vehicleStatus === 'not_registered' ? (
                    <Badge variant="outline" className="gap-1 text-orange-600 border-orange-300">
                      <AlertCircle className="h-3 w-3" />
                      Not Registered
                    </Badge>
                  ) : (
                    <span className="text-sm text-muted-foreground">—</span>
                  )}
                </div>

                {/* Plate Number */}
                <div className="p-3 rounded-lg bg-muted/50 border flex-1">
                  <p className="text-xs text-muted-foreground mb-1">Plate</p>
                  <p className="font-bold font-mono text-lg text-primary truncate">
                    {detectionData?.plate || '—'}
                  </p>
                </div>

                {/* Vehicle Type */}
                <div className="p-3 rounded-lg bg-muted/50 border">
                  <p className="text-xs text-muted-foreground mb-1">Type</p>
                  <p className="text-sm font-medium truncate">
                    {detectionData?.vehicle || '—'}
                  </p>
                </div>

                {/* FASTag */}
                <div className="p-3 rounded-lg bg-muted/50 border">
                  <p className="text-xs text-muted-foreground mb-1">FASTag</p>
                  <p className="text-sm font-medium truncate">
                    {detectionData?.fastag || '—'}
                  </p>
                </div>
              </div>
            </div>

            {/* Approved Vehicle Details (shown when vehicle is registered) */}
            {vehicleStatus === 'Approved' && existingVehicle && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <ShieldCheck className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-green-900 text-sm">Vehicle Registered & Verified</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-green-700">Tare Weight:</span>{' '}
                    <span className="font-medium">{existingVehicle.manufacturer_tare_weight?.toLocaleString()} kg</span>
                  </div>
                  <div>
                    <span className="text-green-700">Type:</span>{' '}
                    <span className="font-medium">{existingVehicle.vehicle_type}</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right Column: PO Verification + Register button stacked */}
        <div className="flex flex-col gap-4">
          {/* PO Verification Card */}
          <Card className="flex-1">
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
                  {poLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
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
                      <p className="text-sm text-red-700">
                        No active purchase order found for this reference
                      </p>
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
                    disabled={isCreatingTrip}
                  >
                    {isCreatingTrip ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Trip...
                      </>
                    ) : (
                      'Create Trip'
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Driver Selection Card - Only show when vehicle is approved */}
          {vehicleStatus === 'Approved' && existingVehicle && (
            <Card className="flex-shrink-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCircle className="h-5 w-5" />
                  Driver Selection
                </CardTitle>
                <CardDescription>Select or register a driver for this trip</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Select Driver Button */}
                <Button
                  onClick={() => setDriverSelectionDialogOpen(true)}
                  className="w-full gap-2"
                  variant="outline"
                >
                  <UserCircle className="h-4 w-4" />
                  {selectedDriverId ? 'Change Driver' : 'Select Driver'}
                </Button>

                {/* Show selected driver info */}
                {selectedDriverId && selectedDriver && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle className="h-4 w-4 text-blue-600" />
                      <span className="font-medium text-blue-900 text-sm">Driver Selected</span>
                    </div>
                    <p className="text-sm font-medium text-blue-900">{selectedDriver.driver_name}</p>
                    <p className="text-xs text-blue-700">
                      📱 {selectedDriver.mobile_number} • Status: {selectedDriver.approval_status}
                    </p>
                  </div>
                )}

                {!selectedDriverId && (
                  <p className="text-xs text-muted-foreground text-center py-2">
                    No driver selected yet
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Vehicle Registration Status Card - Always visible with empty state */}
          <div
            className={`rounded-lg border p-4 space-y-3 transition-colors ${
              !detectionData?.plate
                ? 'bg-slate-50 border-slate-200' // Empty/waiting state
                : vehicleStatus === 'Approved'
                  ? 'bg-green-50 border-green-300'
                  : vehicleStatus === 'Pending'
                    ? 'bg-amber-50 border-amber-300'
                    : 'bg-red-50 border-red-300' // not_registered | Rejected | checking fallback
            }`}
          >
            {/* Status header row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {!detectionData?.plate ? (
                  // Empty state - waiting for detection
                  <>
                    <ScanLine className="h-5 w-5 text-slate-500 animate-pulse" />
                    <span className="font-semibold text-sm text-slate-600">Waiting for Vehicle...</span>
                  </>
                ) : vehicleStatus === 'checking' ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    <span className="font-semibold text-sm text-muted-foreground">Checking vehicle…</span>
                  </>
                ) : vehicleStatus === 'Approved' ? (
                  <>
                    <ShieldCheck className="h-5 w-5 text-green-600" />
                    <span className="font-semibold text-sm text-green-800">Vehicle is Registered</span>
                  </>
                ) : vehicleStatus === 'Pending' ? (
                  <>
                    <Clock className="h-5 w-5 text-amber-600" />
                    <span className="font-semibold text-sm text-amber-800">Registration Pending</span>
                  </>
                ) : vehicleStatus === 'Rejected' ? (
                  <>
                    <Ban className="h-5 w-5 text-red-600" />
                    <span className="font-semibold text-sm text-red-800">Vehicle is Rejected</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    <span className="font-semibold text-sm text-red-800">Vehicle is Not Registered</span>
                  </>
                )}
              </div>

              {/* Plate badge - only show when detected */}
              {detectionData?.plate && (
                <Badge
                  variant="outline"
                  className={`font-mono text-sm ${
                    vehicleStatus === 'Approved'
                      ? 'border-green-400 text-green-800 bg-green-100'
                      : vehicleStatus === 'Pending'
                        ? 'border-amber-400 text-amber-800 bg-amber-100'
                        : 'border-red-400 text-red-800 bg-red-100'
                  }`}
                >
                  {detectionData.plate}
                </Badge>
              )}
            </div>

            {/* Description text */}
            <p className={`text-xs ${
              !detectionData?.plate
                ? 'text-slate-600'
                : vehicleStatus === 'Approved'
                  ? 'text-green-700'
                  : vehicleStatus === 'Pending'
                    ? 'text-amber-700'
                    : 'text-red-700'
            }`}>
              {!detectionData?.plate
                ? 'Detection system is active and monitoring. Vehicle details will appear here once detected by the camera.'
                : vehicleStatus === 'Approved'
                  ? 'This vehicle is verified and ready for trip creation.'
                  : vehicleStatus === 'Pending'
                    ? 'This vehicle is awaiting admin approval.'
                    : vehicleStatus === 'Rejected'
                      ? 'This vehicle has been rejected. Contact an admin to re-verify.'
                      : 'This vehicle is not registered. Register it before creating a trip.'}
            </p>

            {/* Register button — only when not_registered or Rejected */}
            {detectionData?.plate && (vehicleStatus === 'not_registered' || vehicleStatus === 'Rejected') && (
              <CombinedRegistrationDialog
                detectedData={{
                  registrationNumber: detectionData.plate,
                  fastagId: detectionData.fastag,
                  vehicleType: detectionData.vehicle,
                  vehicleImage: detectionData.image,
                }}
                autoLoadDetection={true}
                onSuccess={handleRegistrationSuccess}
                trigger={
                  <Button
                    className="w-full gap-2 bg-red-600 hover:bg-red-700 text-white"
                    disabled={vehicleStatus === 'Rejected'}
                  >
                    <Plus className="h-4 w-4" />
                    Register Vehicle & Driver
                  </Button>
                }
              />
            )}
          </div>
        </div>
      </div>

      {/* Bottom Row - Pending Approvals */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Quick Pending Vehicles */}
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
              <>
                <div className="space-y-3">
                  {pendingVehicles.slice(0, 4).map((vehicle) => (
                    <div
                      key={vehicle.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{vehicle.registration_number}</p>
                        <p className="text-sm text-muted-foreground truncate">
                          {vehicle.vehicle_type} • Tare:{' '}
                          {vehicle.manufacturer_tare_weight?.toLocaleString() || 'N/A'} kg
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
                    <Button 
                      onClick={handleViewAllVehicles}
                      variant="outline" 
                      className="w-full mt-3" 
                      size="sm"
                    >
                      View all {pendingVehicles.length} pending vehicles
                    </Button>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Quick Pending Drivers */}
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
              <>
                <div className="space-y-3">
                  {pendingDrivers.slice(0, 4).map((driver) => (
                    <div
                      key={driver.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{driver.driver_name}</p>
                        <p className="text-sm text-muted-foreground truncate">
                          {driver.mobile_number} • Aadhaar: ****
                          {driver.aadhaar?.slice(-4)}
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
                    <Button 
                      onClick={handleViewAllDrivers}
                      variant="outline" 
                      className="w-full mt-3" 
                      size="sm"
                    >
                      View all {pendingDrivers.length} pending drivers
                    </Button>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create Trip Dialog */}
      <Dialog open={tripDialogOpen} onOpenChange={setTripDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Trip</DialogTitle>
            <DialogDescription>
              Select vehicle and driver for PO: {poData?.po_reference_number}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* PO Info */}
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium">Purchase Order Details</p>
              <p className="text-sm text-muted-foreground mt-1">
                Seller: {poData?.seller_name}
              </p>
              <p className="text-sm text-muted-foreground">
                Valid until: {poData?.validity_end_date}
              </p>
            </div>

            {/* Vehicle Selection */}
            <div className="space-y-2">
              <Label htmlFor="vehicle">Select Vehicle *</Label>
              <Select value={selectedVehicleId} onValueChange={setSelectedVehicleId}>
                <SelectTrigger id="vehicle">
                  <SelectValue placeholder="Choose a vehicle" />
                </SelectTrigger>
                <SelectContent>
                  {approvedVehicles.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground text-center">
                      No approved vehicles available
                    </div>
                  ) : (
                    approvedVehicles.map((vehicle) => (
                      <SelectItem key={vehicle.id} value={vehicle.id.toString()}>
                        {vehicle.registration_number} - {vehicle.vehicle_type}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Driver Selection */}
            <div className="space-y-2">
              <Label htmlFor="driver">Select Driver *</Label>
              <Select value={selectedDriverId} onValueChange={setSelectedDriverId}>
                <SelectTrigger id="driver">
                  <SelectValue placeholder="Choose a driver" />
                </SelectTrigger>
                <SelectContent>
                  {approvedDrivers.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground text-center">
                      No approved drivers available
                    </div>
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
            <Button
              onClick={handleCreateTrip}
              className="flex-1"
              disabled={!selectedVehicleId || !selectedDriverId || isCreatingTrip}
            >
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

      {/* Driver Selection Dialog */}
      <DriverSelectionDialog
        open={driverSelectionDialogOpen}
        onOpenChange={setDriverSelectionDialogOpen}
        onDriverSelected={handleDriverSelected}
      />
    </div>
  );
}