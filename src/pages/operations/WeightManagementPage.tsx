import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { StatsCard } from '@/components/dashboard/widgets/StatsCard';
import { WeightTable } from '@/components/weights/WeightTable';
import { WeightFilters } from '@/components/weights/WeightFilters';
import { WeightFormDialog } from '@/components/weights/WeightFormDialog';
import { WeightDetailDialog } from '@/components/weights/WeightDetailDialog';
import { useWeights, EnrichedWeight } from '@/hooks/useWeights';
import { WeightCreate } from '@/api/types/trip.types';
import { 
  Scale, 
  Plus, 
  RefreshCw, 
  TrendingUp, 
  CheckCircle, 
  XCircle,
  Activity,
} from 'lucide-react';

export default function WeightManagementPage() {
  const { weights, isLoading, createWeight, updateWeight, deleteWeight, refetch } = useWeights();

  // Dialog states
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedWeight, setSelectedWeight] = useState<EnrichedWeight | null>(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('all');

  // Calculate stats
  const stats = useMemo(() => {
    const today = new Date().toDateString();
    const todayWeights = weights.filter(w => 
      new Date(w.capture_time).toDateString() === today
    );
    
    const totalTonnage = weights.reduce((sum, w) => sum + w.weight_value, 0) / 1000;
    const todayTonnage = todayWeights.reduce((sum, w) => sum + w.weight_value, 0) / 1000;
    const passedCount = weights.filter(w => w.status === 'PASSED').length;
    const failedCount = weights.filter(w => w.status === 'FAILED').length;

    return {
      totalRecords: weights.length,
      todayRecords: todayWeights.length,
      totalTonnage: totalTonnage.toFixed(2),
      todayTonnage: todayTonnage.toFixed(2),
      passedCount,
      failedCount,
      passRate: weights.length > 0 
        ? ((passedCount / weights.length) * 100).toFixed(1) 
        : '0',
    };
  }, [weights]);

  // Filter weights
  const filteredWeights = useMemo(() => {
    let filtered = weights;

    // Tab filter
    if (activeTab === 'gross') {
      filtered = filtered.filter(w => w.weight_type === 'Gross');
    } else if (activeTab === 'tare') {
      filtered = filtered.filter(w => w.weight_type === 'Tare');
    } else if (activeTab === 'today') {
      const today = new Date().toDateString();
      filtered = filtered.filter(w => 
        new Date(w.capture_time).toDateString() === today
      );
    }

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(w =>
        w.id.toString().includes(term) ||
        w.trip_id.toString().includes(term) ||
        w.trip_vehicle_id?.toString().includes(term) ||
        w.weight_value.toString().includes(term)
      );
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(w => w.weight_type === typeFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(w => w.status === statusFilter);
    }

    return filtered;
  }, [weights, activeTab, searchTerm, typeFilter, statusFilter]);

  // Handlers
  const handleView = (weight: EnrichedWeight) => {
    setSelectedWeight(weight);
    setDetailDialogOpen(true);
  };

  const handleEdit = (weight: EnrichedWeight) => {
    setSelectedWeight(weight);
    setFormDialogOpen(true);
  };

  const handleDeleteClick = (weight: EnrichedWeight) => {
    setSelectedWeight(weight);
    setDeleteDialogOpen(true);
  };

  const handleCreate = () => {
    setSelectedWeight(null);
    setFormDialogOpen(true);
  };

  const handleFormSubmit = async (data: WeightCreate) => {
    if (selectedWeight) {
      await updateWeight.mutateAsync({ id: selectedWeight.id, data });
    } else {
      await createWeight.mutateAsync(data);
    }
    setFormDialogOpen(false);
    setSelectedWeight(null);
  };

  const handleConfirmDelete = async () => {
    if (selectedWeight) {
      await deleteWeight.mutateAsync(selectedWeight.id);
      setDeleteDialogOpen(false);
      setSelectedWeight(null);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setTypeFilter('all');
    setStatusFilter('all');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Scale className="h-6 w-6" />
            Weight Records
          </h1>
          <p className="text-muted-foreground">
            Manage and view all weight capture records
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button size="sm" onClick={handleCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            Capture Weight
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Records"
          value={stats.totalRecords}
          icon={Activity}
          variant="primary"
        />
        <StatsCard
          title="Today's Tonnage"
          value={`${stats.todayTonnage} MT`}
          icon={TrendingUp}
          variant="success"
          description={`${stats.todayRecords} records today`}
        />
        <StatsCard
          title="Passed"
          value={stats.passedCount}
          icon={CheckCircle}
          variant="info"
          description={`${stats.passRate}% pass rate`}
        />
        <StatsCard
          title="Failed"
          value={stats.failedCount}
          icon={XCircle}
          variant="warning"
        />
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle>Weight Records</CardTitle>
          <CardDescription>
            All captured weight measurements from the weighbridge
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">All ({weights.length})</TabsTrigger>
              <TabsTrigger value="gross">
                Gross ({weights.filter(w => w.weight_type === 'Gross').length})
              </TabsTrigger>
              <TabsTrigger value="tare">
                Tare ({weights.filter(w => w.weight_type === 'Tare').length})
              </TabsTrigger>
              <TabsTrigger value="today">
                Today ({stats.todayRecords})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-4 space-y-4">
              {/* Filters */}
              <WeightFilters
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                typeFilter={typeFilter}
                onTypeChange={setTypeFilter}
                statusFilter={statusFilter}
                onStatusChange={setStatusFilter}
                onClearFilters={clearFilters}
              />

              {/* Table */}
              <WeightTable
                weights={filteredWeights}
                isLoading={isLoading}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDeleteClick}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Form Dialog */}
      <WeightFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        weight={selectedWeight}
        onSubmit={handleFormSubmit}
        isSubmitting={createWeight.isPending || updateWeight.isPending}
      />

      {/* Detail Dialog */}
      <WeightDetailDialog
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        weight={selectedWeight}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Weight Record?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete weight record{' '}
              <strong>WGT-{selectedWeight?.id.toString().padStart(4, '0')}</strong>.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteWeight.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
