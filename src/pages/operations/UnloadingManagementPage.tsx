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
import { UnloadingTable } from '@/components/unloading/UnloadingTable';
import { UnloadingFilters } from '@/components/unloading/UnloadingFilters';
import { UnloadingFormDialog } from '@/components/unloading/UnloadingFormDialog';
import { UnloadingDetailDialog } from '@/components/unloading/UnloadingDetailDialog';
import { useUnloading, EnrichedUnloading } from '@/hooks/useUnloading';
import { MaterialUnloadingCreate } from '@/api/types/trip.types';
import { 
  Package, 
  Plus, 
  RefreshCw, 
  CheckCircle, 
  XCircle,
  Activity,
  AlertTriangle,
} from 'lucide-react';

export default function UnloadingManagementPage() {
  const { 
    unloadings, 
    isLoading, 
    createUnloading, 
    updateUnloading, 
    deleteUnloading, 
    refetch 
  } = useUnloading();

  // Dialog states
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUnloading, setSelectedUnloading] = useState<EnrichedUnloading | null>(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [qualityFilter, setQualityFilter] = useState('all');
  const [materialFilter, setMaterialFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('all');

  // Get unique materials for filter
  const uniqueMaterials = useMemo(() => {
    const materials = new Set(unloadings.map(u => u.material_type));
    return Array.from(materials).sort();
  }, [unloadings]);

  // Calculate stats
  const stats = useMemo(() => {
    const today = new Date().toDateString();
    const todayUnloadings = unloadings.filter(u => 
      new Date(u.verification_time).toDateString() === today
    );
    
    const totalAccepted = unloadings.reduce((sum, u) => sum + u.accepted_qty, 0);
    const totalRejected = unloadings.reduce((sum, u) => sum + u.rejection_qty, 0);
    const totalQty = totalAccepted + totalRejected;
    
    const withRejections = unloadings.filter(u => u.rejection_qty > 0).length;
    const avgRejectionRate = unloadings.length > 0
      ? unloadings.reduce((sum, u) => sum + (u.rejection_rate || 0), 0) / unloadings.length
      : 0;

    return {
      totalRecords: unloadings.length,
      todayRecords: todayUnloadings.length,
      totalAccepted,
      totalRejected,
      totalQty,
      withRejections,
      avgRejectionRate: avgRejectionRate.toFixed(1),
      acceptanceRate: totalQty > 0 ? ((totalAccepted / totalQty) * 100).toFixed(1) : '100',
    };
  }, [unloadings]);

  // Filter unloadings
  const filteredUnloadings = useMemo(() => {
    let filtered = unloadings;

    // Tab filter
    if (activeTab === 'today') {
      const today = new Date().toDateString();
      filtered = filtered.filter(u => 
        new Date(u.verification_time).toDateString() === today
      );
    } else if (activeTab === 'rejections') {
      filtered = filtered.filter(u => u.rejection_qty > 0);
    } else if (activeTab === 'clean') {
      filtered = filtered.filter(u => u.rejection_qty === 0);
    }

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(u =>
        u.id.toString().includes(term) ||
        u.trip_id.toString().includes(term) ||
        u.material_type.toLowerCase().includes(term)
      );
    }

    // Quality filter
    if (qualityFilter !== 'all') {
      filtered = filtered.filter(u => {
        const rate = u.rejection_rate || 0;
        switch (qualityFilter) {
          case 'excellent': return rate === 0;
          case 'good': return rate > 0 && rate < 5;
          case 'fair': return rate >= 5 && rate < 15;
          case 'poor': return rate >= 15;
          default: return true;
        }
      });
    }

    // Material filter
    if (materialFilter !== 'all') {
      filtered = filtered.filter(u => u.material_type === materialFilter);
    }

    return filtered;
  }, [unloadings, activeTab, searchTerm, qualityFilter, materialFilter]);

  // Handlers
  const handleView = (unloading: EnrichedUnloading) => {
    setSelectedUnloading(unloading);
    setDetailDialogOpen(true);
  };

  const handleEdit = (unloading: EnrichedUnloading) => {
    setSelectedUnloading(unloading);
    setFormDialogOpen(true);
  };

  const handleDeleteClick = (unloading: EnrichedUnloading) => {
    setSelectedUnloading(unloading);
    setDeleteDialogOpen(true);
  };

  const handleCreate = () => {
    setSelectedUnloading(null);
    setFormDialogOpen(true);
  };

  const handleFormSubmit = async (data: MaterialUnloadingCreate) => {
    if (selectedUnloading) {
      await updateUnloading.mutateAsync({ id: selectedUnloading.id, data });
    } else {
      await createUnloading.mutateAsync(data);
    }
    setFormDialogOpen(false);
    setSelectedUnloading(null);
  };

  const handleConfirmDelete = async () => {
    if (selectedUnloading) {
      await deleteUnloading.mutateAsync(selectedUnloading.id);
      setDeleteDialogOpen(false);
      setSelectedUnloading(null);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setQualityFilter('all');
    setMaterialFilter('all');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Package className="h-6 w-6" />
            Material Unloading
          </h1>
          <p className="text-muted-foreground">
            Quality verification and rejection tracking
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button size="sm" onClick={handleCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            New Verification
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
          description={`${stats.todayRecords} today`}
        />
        <StatsCard
          title="Accepted Qty"
          value={stats.totalAccepted.toLocaleString()}
          icon={CheckCircle}
          variant="success"
          description={`${stats.acceptanceRate}% acceptance rate`}
        />
        <StatsCard
          title="Rejected Qty"
          value={stats.totalRejected.toLocaleString()}
          icon={XCircle}
          variant="warning"
          description={`${stats.avgRejectionRate}% avg rejection`}
        />
        <StatsCard
          title="With Rejections"
          value={stats.withRejections}
          icon={AlertTriangle}
          variant="info"
          description="Records with rejections"
        />
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle>Unloading Records</CardTitle>
          <CardDescription>
            Material unloading verification with quality tracking
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">All ({unloadings.length})</TabsTrigger>
              <TabsTrigger value="today">
                Today ({stats.todayRecords})
              </TabsTrigger>
              <TabsTrigger value="rejections">
                With Rejections ({stats.withRejections})
              </TabsTrigger>
              <TabsTrigger value="clean">
                Clean ({unloadings.filter(u => u.rejection_qty === 0).length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-4 space-y-4">
              {/* Filters */}
              <UnloadingFilters
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                qualityFilter={qualityFilter}
                onQualityChange={setQualityFilter}
                materialFilter={materialFilter}
                onMaterialChange={setMaterialFilter}
                materials={uniqueMaterials}
                onClearFilters={clearFilters}
              />

              {/* Table */}
              <UnloadingTable
                unloadings={filteredUnloadings}
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
      <UnloadingFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        unloading={selectedUnloading}
        onSubmit={handleFormSubmit}
        isSubmitting={createUnloading.isPending || updateUnloading.isPending}
      />

      {/* Detail Dialog */}
      <UnloadingDetailDialog
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        unloading={selectedUnloading}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Unloading Record?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete unloading record{' '}
              <strong>UNL-{selectedUnloading?.id.toString().padStart(4, '0')}</strong>.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteUnloading.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
