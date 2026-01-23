import { useState, useMemo } from 'react';
import { StatsCard } from '@/components/dashboard/widgets/StatsCard';
import { POFilters } from '@/components/purchase-orders/POFilters';
import { POTable } from '@/components/purchase-orders/POTable';
import { POFormDialog } from '@/components/purchase-orders/POFormDialog';
import { PODetailDialog } from '@/components/purchase-orders/PODetailDialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, CheckCircle, XCircle, Clock, Plus } from 'lucide-react';
import { usePurchaseOrders, useMaterials, usePurchaseOrderMutations } from '@/hooks/usePurchaseOrders';
import { POOut, POCreate } from '@/api/types/purchaseOrder.types';
import { POStatus } from '@/api/types/common.types';

export default function PurchaseOrderManagementPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<POStatus | 'all'>('all');
  const [activeTab, setActiveTab] = useState('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedPO, setSelectedPO] = useState<POOut | null>(null);

  const { data: allPurchaseOrders = [], isLoading } = usePurchaseOrders();
  const { data: materials = [] } = useMaterials();
  const { createPurchaseOrder, deletePurchaseOrder, isCreating } = usePurchaseOrderMutations();

  // Filter purchase orders
  const filteredPOs = useMemo(() => {
    return allPurchaseOrders.filter((po) => {
      const matchesSearch =
        po.po_reference_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        po.seller_name.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || po.status === statusFilter;
      
      const matchesTab =
        activeTab === 'all' ||
        (activeTab === 'active' && po.status === 'Active') ||
        (activeTab === 'expired' && po.status === 'Expired') ||
        (activeTab === 'closed' && po.status === 'Closed');
      
      return matchesSearch && matchesStatus && matchesTab;
    });
  }, [allPurchaseOrders, searchQuery, statusFilter, activeTab]);

  // Stats calculations
  const stats = useMemo(() => {
    return {
      total: allPurchaseOrders.length,
      active: allPurchaseOrders.filter((po) => po.status === 'Active').length,
      expired: allPurchaseOrders.filter((po) => po.status === 'Expired').length,
      closed: allPurchaseOrders.filter((po) => po.status === 'Closed').length,
    };
  }, [allPurchaseOrders]);

  const handleCreatePO = (data: POCreate) => {
    createPurchaseOrder(data, {
      onSuccess: () => setIsFormOpen(false),
    });
  };

  const handleViewPO = (po: POOut) => {
    setSelectedPO(po);
  };

  const handleDeletePO = (id: number) => {
    deletePurchaseOrder(id);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Purchase Orders</h1>
          <p className="text-muted-foreground">
            Manage purchase orders, materials, and seller information
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Create PO
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total POs"
          value={stats.total}
          icon={FileText}
          variant="default"
        />
        <StatsCard
          title="Active"
          value={stats.active}
          icon={CheckCircle}
          variant="success"
        />
        <StatsCard
          title="Expired"
          value={stats.expired}
          icon={XCircle}
          variant="warning"
        />
        <StatsCard
          title="Closed"
          value={stats.closed}
          icon={Clock}
          variant="info"
        />
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Purchase Order Directory
          </CardTitle>
          <CardDescription>
            View and manage all purchase orders
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <POFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
          />

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
              <TabsTrigger value="active">Active ({stats.active})</TabsTrigger>
              <TabsTrigger value="expired">Expired ({stats.expired})</TabsTrigger>
              <TabsTrigger value="closed">Closed ({stats.closed})</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-4">
              <POTable
                purchaseOrders={filteredPOs}
                isLoading={isLoading}
                onView={handleViewPO}
                onDelete={handleDeletePO}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Form Dialog */}
      <POFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleCreatePO}
        isSubmitting={isCreating}
        materials={materials}
      />

      {/* Detail Dialog */}
      <PODetailDialog
        open={selectedPO !== null}
        onOpenChange={(open) => !open && setSelectedPO(null)}
        purchaseOrder={selectedPO}
        materials={materials}
      />
    </div>
  );
}
