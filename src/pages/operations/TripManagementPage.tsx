import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatsCard } from '@/components/dashboard/widgets/StatsCard';
import { TripFilters } from '@/components/trips/TripFilters';
import { TripTable } from '@/components/trips/TripTable';
import { TripFormDialog } from '@/components/trips/TripFormDialog';
import { TripDetailDialog } from '@/components/trips/TripDetailDialog';
import { StageAdvanceDialog } from '@/components/trips/StageAdvanceDialog';
import { useTrips } from '@/hooks/useTrips';
import { TripOut } from '@/api/types/trip.types';
import { TripStatus, TripStage } from '@/api/types/common.types';
import { Plus, Route, CheckCircle2, Clock, RefreshCw, Scale } from 'lucide-react';

export default function TripManagementPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'completed'>('all');
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState<TripStage | 'all'>('all');
  const [formOpen, setFormOpen] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<TripOut | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [advanceOpen, setAdvanceOpen] = useState(false);

  const statusFilter: TripStatus | undefined =
    activeTab === 'active' ? 'ACTIVE' : activeTab === 'completed' ? 'COMPLETED' : undefined;

  const { data: trips, isLoading, refetch } = useTrips(statusFilter);

  const filteredTrips = useMemo(() => {
    return trips.filter((trip) => {
      const searchLower = search.toLowerCase();
      const matchesSearch =
        !search ||
        trip.id.toString().includes(searchLower) ||
        `trp-${trip.id}`.includes(searchLower) ||
        trip.vehicle_id.toString().includes(searchLower) ||
        trip.driver_id.toString().includes(searchLower);

      const matchesStage = stageFilter === 'all' || trip.current_stage === stageFilter;

      return matchesSearch && matchesStage;
    });
  }, [trips, search, stageFilter]);

  const stats = useMemo(() => {
    const active = trips.filter((t) => t.status === 'ACTIVE').length;
    const completed = trips.filter((t) => t.status === 'COMPLETED').length;
    const atWeighbridge = trips.filter(
      (t) => t.current_stage === 'GROSS_WEIGHT' || t.current_stage === 'TARE_WEIGHT'
    ).length;
    const totalWeight = trips.reduce((sum, t) => {
      if (t.gross_weight && t.tare_weight) {
        return sum + (t.gross_weight - t.tare_weight);
      }
      return sum;
    }, 0);

    return { active, completed, atWeighbridge, totalWeight };
  }, [trips]);

  const handleViewDetails = (trip: TripOut) => {
    setSelectedTrip(trip);
    setDetailOpen(true);
  };

  const handleAdvanceStage = (trip: TripOut) => {
    setSelectedTrip(trip);
    setAdvanceOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Trip Management</h1>
          <p className="text-muted-foreground">
            Create, monitor, and advance trips through processing stages
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Trip
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatsCard
          title="Active Trips"
          value={stats.active}
          icon={Route}
          description="Currently in progress"
        />
        <StatsCard
          title="Completed Today"
          value={stats.completed}
          icon={CheckCircle2}
          description="Successfully processed"
        />
        <StatsCard
          title="At Weighbridge"
          value={stats.atWeighbridge}
          icon={Scale}
          description="Pending weight capture"
        />
        <StatsCard
          title="Total Net Weight"
          value={`${(stats.totalWeight / 1000).toFixed(1)} T`}
          icon={Scale}
          description="Material processed"
        />
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <CardTitle>All Trips</CardTitle>
          <CardDescription>
            View and manage all trips in the system
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
              </TabsList>
              <TripFilters
                search={search}
                onSearchChange={setSearch}
                stageFilter={stageFilter}
                onStageFilterChange={setStageFilter}
              />
            </div>

            <TabsContent value="all" className="mt-4">
              <TripTable
                trips={filteredTrips}
                isLoading={isLoading}
                onViewDetails={handleViewDetails}
                onAdvanceStage={handleAdvanceStage}
              />
            </TabsContent>

            <TabsContent value="active" className="mt-4">
              <TripTable
                trips={filteredTrips}
                isLoading={isLoading}
                onViewDetails={handleViewDetails}
                onAdvanceStage={handleAdvanceStage}
              />
            </TabsContent>

            <TabsContent value="completed" className="mt-4">
              <TripTable
                trips={filteredTrips}
                isLoading={isLoading}
                onViewDetails={handleViewDetails}
                onAdvanceStage={handleAdvanceStage}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <TripFormDialog open={formOpen} onOpenChange={setFormOpen} />
      <TripDetailDialog
        trip={selectedTrip}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
      <StageAdvanceDialog
        trip={selectedTrip}
        open={advanceOpen}
        onOpenChange={setAdvanceOpen}
      />
    </div>
  );
}
