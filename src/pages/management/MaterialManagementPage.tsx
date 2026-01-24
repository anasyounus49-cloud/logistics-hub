import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Package, Boxes, Layers } from 'lucide-react';
import { StatsCard } from '@/components/dashboard/widgets/StatsCard';
import { MaterialFilters } from '@/components/materials/MaterialFilters';
import { MaterialTable } from '@/components/materials/MaterialTable';
import { MaterialFormDialog } from '@/components/materials/MaterialFormDialog';
import {
  useMaterials,
  useCreateMaterial,
  useUpdateMaterial,
  useDeleteMaterial,
} from '@/hooks/useMaterials';
import { MaterialOut, MaterialCreate } from '@/api/types/material.types';

export default function MaterialManagementPage() {
  const [search, setSearch] = useState('');
  const [unitFilter, setUnitFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<MaterialOut | null>(null);

  // Queries
  const { data: materials = [], isLoading } = useMaterials({
    search: search || undefined,
  });

  // Mutations
  const createMaterial = useCreateMaterial();
  const updateMaterial = useUpdateMaterial();
  const deleteMaterial = useDeleteMaterial();

  // Get unique units for stats
  const uniqueUnits = useMemo(() => {
    const units = new Set(materials.map((m) => m.unit));
    return Array.from(units);
  }, [materials]);

  // Filter materials based on tab and unit filter
  const filteredMaterials = useMemo(() => {
    let filtered = materials;

    // Filter by unit
    if (unitFilter !== 'all') {
      filtered = filtered.filter((m) => m.unit === unitFilter);
    }

    // Filter by tab (could be by grade or custom categories)
    if (activeTab !== 'all') {
      if (activeTab === 'graded') {
        filtered = filtered.filter((m) => m.grade !== null && m.grade !== '');
      } else if (activeTab === 'ungraded') {
        filtered = filtered.filter((m) => !m.grade || m.grade === '');
      }
    }

    return filtered;
  }, [materials, unitFilter, activeTab]);

  // Stats
  const stats = useMemo(() => {
    const total = materials.length;
    const graded = materials.filter((m) => m.grade !== null && m.grade !== '').length;
    const ungraded = materials.filter((m) => !m.grade || m.grade === '').length;
    const uniqueUnitsCount = uniqueUnits.length;

    return { total, graded, ungraded, uniqueUnitsCount };
  }, [materials, uniqueUnits]);

  const handleCreate = () => {
    setSelectedMaterial(null);
    setDialogOpen(true);
  };

  const handleEdit = (material: MaterialOut) => {
    setSelectedMaterial(material);
    setDialogOpen(true);
  };

  const handleSubmit = (data: MaterialCreate) => {
    if (selectedMaterial) {
      updateMaterial.mutate({ id: selectedMaterial.id, data });
    } else {
      createMaterial.mutate(data);
    }
  };

  const handleDelete = (id: number) => {
    deleteMaterial.mutate(id);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Material Management</h1>
          <p className="text-muted-foreground">
            Manage materials, grades, and units in the system
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add Material
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatsCard
          title="Total Materials"
          value={stats.total}
          icon={Package}
          trend={{ value: 0, isPositive: true }}
        />
        <StatsCard
          title="With Grade"
          value={stats.graded}
          icon={Layers}
          trend={{ value: 0, isPositive: true }}
        />
        <StatsCard
          title="Without Grade"
          value={stats.ungraded}
          icon={Boxes}
          trend={{ value: 0, isPositive: true }}
        />
        <StatsCard
          title="Unique Units"
          value={stats.uniqueUnitsCount}
          icon={Package}
          trend={{ value: 0, isPositive: true }}
        />
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <CardTitle>Material Directory</CardTitle>
          <CardDescription>
            View and manage all materials. Filter by unit and grade.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <MaterialFilters
            search={search}
            onSearchChange={setSearch}
            unitFilter={unitFilter}
            onUnitFilterChange={setUnitFilter}
          />

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
              <TabsTrigger value="graded">With Grade ({stats.graded})</TabsTrigger>
              <TabsTrigger value="ungraded">
                Without Grade ({stats.ungraded})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-4">
              <MaterialTable
                materials={filteredMaterials}
                isLoading={isLoading}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Form Dialog */}
      <MaterialFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        material={selectedMaterial}
        onSubmit={handleSubmit}
        isLoading={createMaterial.isPending || updateMaterial.isPending}
      />
    </div>
  );
}
