import { useState, useCallback } from 'react';
import { Plus, Users, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StaffFilters } from '@/components/staff/StaffFilters';
import { StaffTable } from '@/components/staff/StaffTable';
import { StaffFormDialog } from '@/components/staff/StaffFormDialog';
import { useStaff, useCreateStaff, useUpdateStaff, useDeleteStaff } from '@/hooks/useStaff';
import { Staff, StaffCreate, StaffUpdate } from '@/api/types/auth.types';
import { UserRole, Department } from '@/api/types/common.types';

export default function StaffManagementPage() {
  // Filter state
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
  const [departmentFilter, setDepartmentFilter] = useState<Department | 'all'>('all');

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);

  // Queries and mutations
  const { data: staff = [], isLoading, refetch } = useStaff({
    search,
    role: roleFilter !== 'all' ? roleFilter : undefined,
    department: departmentFilter !== 'all' ? departmentFilter : undefined,
  });

  const createMutation = useCreateStaff();
  const updateMutation = useUpdateStaff();
  const deleteMutation = useDeleteStaff();

  const handleClearFilters = useCallback(() => {
    setSearch('');
    setRoleFilter('all');
    setDepartmentFilter('all');
  }, []);

  const handleAddNew = useCallback(() => {
    setEditingStaff(null);
    setDialogOpen(true);
  }, []);

  const handleEdit = useCallback((staffMember: Staff) => {
    setEditingStaff(staffMember);
    setDialogOpen(true);
  }, []);

  const handleDelete = useCallback((id: number) => {
    deleteMutation.mutate(id);
  }, [deleteMutation]);

  const handleSubmit = useCallback(
    (data: StaffCreate | StaffUpdate) => {
      if (editingStaff) {
        updateMutation.mutate(
          { id: editingStaff.id, data: data as StaffUpdate },
          { onSuccess: () => setDialogOpen(false) }
        );
      } else {
        createMutation.mutate(data as StaffCreate, {
          onSuccess: () => setDialogOpen(false),
        });
      }
    },
    [editingStaff, createMutation, updateMutation]
  );

  // Statistics
  const totalStaff = staff.length;
  const activeStaff = staff.filter((s) => s.is_active).length;
  const adminCount = staff.filter((s) => s.role === 'super admin' || s.role === 'admin').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Staff Management</h1>
          <p className="text-muted-foreground">
            Manage staff accounts, roles, and permissions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={handleAddNew}>
            <Plus className="h-4 w-4 mr-2" />
            Add Staff
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStaff}</div>
            <p className="text-xs text-muted-foreground">registered members</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Staff</CardTitle>
            <div className="h-2 w-2 rounded-full bg-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeStaff}</div>
            <p className="text-xs text-muted-foreground">
              {totalStaff > 0 ? ((activeStaff / totalStaff) * 100).toFixed(0) : 0}% of total
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Administrators</CardTitle>
            <div className="h-2 w-2 rounded-full bg-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{adminCount}</div>
            <p className="text-xs text-muted-foreground">admin & super admin</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Table */}
      <Card>
        <CardHeader>
          <CardTitle>Staff Directory</CardTitle>
          <CardDescription>
            View and manage all staff members in your organization
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <StaffFilters
            search={search}
            onSearchChange={setSearch}
            role={roleFilter}
            onRoleChange={setRoleFilter}
            department={departmentFilter}
            onDepartmentChange={setDepartmentFilter}
            onClearFilters={handleClearFilters}
          />

          <StaffTable
            staff={staff}
            isLoading={isLoading}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </CardContent>
      </Card>

      {/* Form Dialog */}
      <StaffFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        staff={editingStaff}
        onSubmit={handleSubmit}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
}
