import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useDrivers, useDriver } from '@/hooks/useDrivers';
import { DriverRegistrationForm } from './DriverRegistrationForm';
import {
  Search,
  UserPlus,
  CheckCircle,
  Clock,
  Ban,
  RefreshCw,
  Loader2,
  AlertTriangle,
  User,
} from 'lucide-react';

interface DriverSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDriverSelected?: (driverId: number, driverPhone: string) => void;
}

export function DriverSelectionDialog({
  open,
  onOpenChange,
  onDriverSelected,
}: DriverSelectionDialogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDriverId, setSelectedDriverId] = useState<number | null>(null);
  const [registrationDialogOpen, setRegistrationDialogOpen] = useState(false);
  const [newlyCreatedDriverId, setNewlyCreatedDriverId] = useState<number | null>(null);

  const { data: allDrivers, isLoading, refetch: refetchDrivers } = useDrivers();
  
  // Fetch selected driver details to check approval status
  const {
    data: selectedDriver,
    isLoading: selectedDriverLoading,
    refetch: refetchSelectedDriver,
  } = useDriver(selectedDriverId || 0);

  // Filter drivers based on search query
  const filteredDrivers = allDrivers?.filter((driver) => {
    const query = searchQuery.toLowerCase();
    return (
      driver.driver_name.toLowerCase().includes(query) ||
      driver.mobile_number.includes(query) ||
      (driver.aadhaar && driver.aadhaar.toLowerCase().includes(query))
    );
  });

  const noDriversFound = searchQuery && filteredDrivers?.length === 0;

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setSearchQuery('');
      setSelectedDriverId(null);
      setNewlyCreatedDriverId(null);
    }
  }, [open]);

  // Highlight newly created driver
  useEffect(() => {
    if (newlyCreatedDriverId) {
      setSelectedDriverId(newlyCreatedDriverId);
    }
  }, [newlyCreatedDriverId]);

  const handleDriverSelect = (driverId: number) => {
    setSelectedDriverId(driverId);
  };

  const handleConfirmSelection = () => {
    if (!selectedDriver) return;

    onDriverSelected?.(selectedDriver.id, selectedDriver.mobile_number);
    onOpenChange(false);
  };

  const handleNewDriverCreated = (driverId: number, driverPhone: string) => {
    setNewlyCreatedDriverId(driverId);
    refetchDrivers(); // Refresh the driver list to show the new driver
  };

  const getDriverStatusBadge = (approvalStatus: string, isNewlyCreated: boolean) => {
    if (approvalStatus === 'Approved') {
      return (
        <Badge className="bg-green-500 hover:bg-green-600 gap-1">
          <CheckCircle className="h-3 w-3" />
          Approved
        </Badge>
      );
    } else if (approvalStatus === 'Pending') {
      return (
        <Badge
          variant="secondary"
          className={`gap-1 ${
            isNewlyCreated ? 'bg-amber-100 border-amber-300 text-amber-800' : ''
          }`}
        >
          <Clock className="h-3 w-3" />
          Pending
        </Badge>
      );
    } else if (approvalStatus === 'Rejected') {
      return (
        <Badge variant="destructive" className="gap-1">
          <Ban className="h-3 w-3" />
          Rejected
        </Badge>
      );
    }
    return null;
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Select Driver
            </DialogTitle>
            <DialogDescription>
              Search for an existing driver or register a new one
            </DialogDescription>
          </DialogHeader>

          {/* Search Box */}
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, phone, or Aadhaar..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Driver List */}
            <ScrollArea className="h-[300px] rounded-md border p-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  <span className="ml-2 text-sm text-muted-foreground">Loading drivers...</span>
                </div>
              ) : filteredDrivers && filteredDrivers.length > 0 ? (
                <div className="space-y-2">
                  {filteredDrivers.map((driver) => {
                    const isSelected = selectedDriverId === driver.id;
                    const isNewlyCreated = newlyCreatedDriverId === driver.id;

                    return (
                      <div
                        key={driver.id}
                        onClick={() => handleDriverSelect(driver.id)}
                        className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                          isSelected
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:bg-accent'
                        } ${isNewlyCreated ? 'bg-amber-50 border-amber-300' : ''}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-medium truncate">{driver.driver_name}</p>
                              {isNewlyCreated && (
                                <Badge variant="outline" className="text-xs">
                                  New
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              📱 {driver.mobile_number}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Aadhaar: {driver.aadhaar ? `****${driver.aadhaar.slice(-4)}` : 'N/A'}
                            </p>
                          </div>
                          {getDriverStatusBadge(driver.approval_status, isNewlyCreated)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : noDriversFound ? (
                <div className="text-center py-8">
                  <User className="h-12 w-12 mx-auto mb-3 opacity-50 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-4">
                    No driver found matching your search
                  </p>
                  <Button
                    onClick={() => setRegistrationDialogOpen(true)}
                    variant="outline"
                    className="gap-2"
                  >
                    <UserPlus className="h-4 w-4" />
                    Register New Driver
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <User className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Start typing to search for drivers</p>
                </div>
              )}
            </ScrollArea>

            {/* Selected Driver Status Warning */}
            {selectedDriver && selectedDriver.approval_status === 'Pending' && (
              <Alert className="bg-amber-50 border-amber-300">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5" />
                    <div className="flex-1">
                      <AlertDescription className="text-amber-800">
                        <strong>Driver not approved yet.</strong> This driver is pending admin
                        approval. Trips cannot be created until approved.
                      </AlertDescription>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => refetchSelectedDriver()}
                    disabled={selectedDriverLoading}
                    className="flex-shrink-0"
                    title="Refresh driver status"
                  >
                    <RefreshCw
                      className={`h-4 w-4 ${selectedDriverLoading ? 'animate-spin' : ''}`}
                    />
                  </Button>
                </div>
              </Alert>
            )}

            {selectedDriver && selectedDriver.approval_status === 'Rejected' && (
              <Alert variant="destructive">
                <Ban className="h-4 w-4" />
                <AlertDescription>
                  This driver has been rejected. Please contact an administrator.
                </AlertDescription>
              </Alert>
            )}
          </div>

          <Separator />

          <DialogFooter className="flex items-center justify-between sm:justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => setRegistrationDialogOpen(true)}
              className="gap-2"
            >
              <UserPlus className="h-4 w-4" />
              New Driver
            </Button>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleConfirmSelection}
                disabled={!selectedDriver || selectedDriver.approval_status === 'Rejected'}
              >
                Confirm Selection
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Nested Driver Registration Dialog */}
      <DriverRegistrationForm
        open={registrationDialogOpen}
        onOpenChange={setRegistrationDialogOpen}
        onSuccess={handleNewDriverCreated}
      />
    </>
  );
}