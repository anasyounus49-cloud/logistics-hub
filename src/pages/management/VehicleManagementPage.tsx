// src/pages/management/VehicleManagementPage.tsx
import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { VehicleTable } from '@/components/vehicles/VehicleTable';
import { VehicleFormDialog } from '@/components/vehicles/VehicleFormDialog';
import { VehicleFilters } from '@/components/vehicles/VehicleFilters';
import { useVehicles } from '@/hooks/useVehicles';
import { ApprovalStatus } from '@/api/types/common.types';
import { Truck } from 'lucide-react';

export const VehicleManagementPage = () => {
  const {
    vehicles,
    loading,
    createVehicle,
    approveVehicle,
    rejectVehicle,
  } = useVehicles();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ApprovalStatus | 'all'>('all');
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState('all');

  // Filter vehicles
  const filteredVehicles = useMemo(() => {
    return vehicles.filter((vehicle) => {
      const matchesSearch = vehicle.registration_number
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === 'all' || vehicle.approval_status === statusFilter;
      const matchesType =
        vehicleTypeFilter === 'all' || vehicle.vehicle_type === vehicleTypeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [vehicles, searchTerm, statusFilter, vehicleTypeFilter]);

  // Separate by status
  const pendingVehicles = useMemo(
    () => filteredVehicles.filter((v) => v.approval_status === 'Pending'),
    [filteredVehicles]
  );

  const approvedVehicles = useMemo(
    () => filteredVehicles.filter((v) => v.approval_status === 'Approved'),
    [filteredVehicles]
  );

  const rejectedVehicles = useMemo(
    () => filteredVehicles.filter((v) => v.approval_status === 'Rejected'),
    [filteredVehicles]
  );

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Truck className="h-8 w-8" />
            Vehicle Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage and monitor all registered vehicles
          </p>
        </div>
        <VehicleFormDialog onSubmit={createVehicle} />
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Vehicles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vehicles.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {pendingVehicles.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {approvedVehicles.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {rejectedVehicles.length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Filter vehicles by various criteria</CardDescription>
        </CardHeader>
        <CardContent>
          <VehicleFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            vehicleTypeFilter={vehicleTypeFilter}
            onVehicleTypeFilterChange={setVehicleTypeFilter}
          />
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">
            All ({filteredVehicles.length})
          </TabsTrigger>
          <TabsTrigger value="Pending">
            Pending ({pendingVehicles.length})
          </TabsTrigger>
          <TabsTrigger value="Approved">
            Approved ({approvedVehicles.length})
          </TabsTrigger>
          <TabsTrigger value="Rejected">
            Rejected ({rejectedVehicles.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <VehicleTable
            vehicles={filteredVehicles}
            loading={loading}
            onApprove={approveVehicle}
            onReject={rejectVehicle}
          />
        </TabsContent>

        <TabsContent value="Pending" className="space-y-4">
          <VehicleTable
            vehicles={pendingVehicles}
            loading={loading}
            onApprove={approveVehicle}
            onReject={rejectVehicle}
          />
        </TabsContent>

        <TabsContent value="Approved" className="space-y-4">
          <VehicleTable
            vehicles={approvedVehicles}
            loading={loading}
            onApprove={approveVehicle}
            onReject={rejectVehicle}
          />
        </TabsContent>

        <TabsContent value="Rejected" className="space-y-4">
          <VehicleTable
            vehicles={rejectedVehicles}
            loading={loading}
            onApprove={approveVehicle}
            onReject={rejectVehicle}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};