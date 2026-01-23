import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserPlus, Users, Clock, CheckCircle, XCircle } from 'lucide-react';
import { StatsCard } from '@/components/dashboard/widgets/StatsCard';
import { DriverFilters } from '@/components/drivers/DriverFilters';
import { DriverTable } from '@/components/drivers/DriverTable';
import { DriverFormDialog } from '@/components/drivers/DriverFormDialog';
import {
  useDrivers,
  useCreateDriver,
  useUpdateDriver,
  useDeleteDriver,
  useApproveDriver,
  useRejectDriver,
} from '@/hooks/useDrivers';
import { DriverOut, DriverCreate } from '@/api/types/driver.types';
import { ApprovalStatus } from '@/api/types/common.types';

export default function DriverManagementPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ApprovalStatus | 'all'>('all');
  const [activeTab, setActiveTab] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<DriverOut | null>(null);

  // Queries
  const { data: drivers = [], isLoading } = useDrivers({
    search: search || undefined,
    approval_status: statusFilter !== 'all' ? statusFilter : undefined,
  });

  // Mutations
  const createDriver = useCreateDriver();
  const updateDriver = useUpdateDriver();
  const deleteDriver = useDeleteDriver();
  const approveDriver = useApproveDriver();
  const rejectDriver = useRejectDriver();

  // Filter drivers based on tab
  const filteredDrivers = useMemo(() => {
    if (activeTab === 'all') return drivers;
    return drivers.filter((d) => d.approval_status === activeTab);
  }, [drivers, activeTab]);

  // Stats
  const stats = useMemo(() => {
    const total = drivers.length;
    const pending = drivers.filter((d) => d.approval_status === 'Pending').length;
    const approved = drivers.filter((d) => d.approval_status === 'Approved').length;
    const rejected = drivers.filter((d) => d.approval_status === 'Rejected').length;
    return { total, pending, approved, rejected };
  }, [drivers]);

  const handleCreate = () => {
    setSelectedDriver(null);
    setDialogOpen(true);
  };

  const handleEdit = (driver: DriverOut) => {
    setSelectedDriver(driver);
    setDialogOpen(true);
  };

  const handleSubmit = (data: DriverCreate) => {
    if (selectedDriver) {
      updateDriver.mutate({ id: selectedDriver.id, data });
    } else {
      createDriver.mutate(data);
    }
  };

  const handleDelete = (id: number) => {
    deleteDriver.mutate(id);
  };

  const handleApprove = (id: number) => {
    approveDriver.mutate(id);
  };

  const handleReject = (id: number) => {
    rejectDriver.mutate(id);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Driver Management</h1>
          <p className="text-muted-foreground">
            Register, approve, and manage drivers in the system
          </p>
        </div>
        <Button onClick={handleCreate}>
          <UserPlus className="mr-2 h-4 w-4" />
          Register Driver
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatsCard
          title="Total Drivers"
          value={stats.total}
          icon={Users}
          trend={{ value: 0, isPositive: true }}
        />
        <StatsCard
          title="Pending Approval"
          value={stats.pending}
          icon={Clock}
          trend={{ value: 0, isPositive: true }}
        />
        <StatsCard
          title="Approved"
          value={stats.approved}
          icon={CheckCircle}
          trend={{ value: 0, isPositive: true }}
        />
        <StatsCard
          title="Rejected"
          value={stats.rejected}
          icon={XCircle}
          trend={{ value: 0, isPositive: false }}
        />
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <CardTitle>Driver Directory</CardTitle>
          <CardDescription>
            View and manage all registered drivers. Approve pending registrations.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <DriverFilters
            search={search}
            onSearchChange={setSearch}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
          />

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">
                All ({stats.total})
              </TabsTrigger>
              <TabsTrigger value="Pending">
                Pending ({stats.pending})
              </TabsTrigger>
              <TabsTrigger value="Approved">
                Approved ({stats.approved})
              </TabsTrigger>
              <TabsTrigger value="Rejected">
                Rejected ({stats.rejected})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-4">
              <DriverTable
                drivers={filteredDrivers}
                isLoading={isLoading}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onApprove={handleApprove}
                onReject={handleReject}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Form Dialog */}
      <DriverFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        driver={selectedDriver}
        onSubmit={handleSubmit}
        isLoading={createDriver.isPending || updateDriver.isPending}
      />
    </div>
  );
}
