import { StatsCard } from '@/components/dashboard/widgets/StatsCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusBadge } from '@/components/common/StatusBadge';
import { TripStageProgress } from '@/components/common/TripStageProgress';
import { useOperatorStats } from '@/hooks/useDashboardStats';
import { TripStage } from '@/api/types/common.types';
import { 
  Scale, 
  Route, 
  Package,
  CheckCircle,
  Play,
  RefreshCw,
} from 'lucide-react';

export default function OperatorDashboard() {
  const { isLoading, stats, data, refetch } = useOperatorStats();

  // Get the first active trip for the weight capture station
  const currentTrip = data.activeTrips[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Operator Dashboard</h1>
          <p className="text-muted-foreground">
            Weight capture, trip progression, and quality verification
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
          <>
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))}
          </>
        ) : (
          <>
            <StatsCard
              title="Active Trips"
              value={stats.activeTrips}
              icon={Route}
              variant="primary"
            />
            <StatsCard
              title="Weights Captured"
              value={stats.weightsCaptured}
              icon={Scale}
              variant="success"
              description="Today"
            />
            <StatsCard
              title="Quality Checks"
              value={stats.qualityChecks}
              icon={CheckCircle}
              variant="info"
              description="Today"
            />
            <StatsCard
              title="Pending Unloads"
              value={stats.pendingUnloads}
              icon={Package}
              variant="warning"
            />
          </>
        )}
      </div>

      {/* Weight Capture Interface */}
      <Card className="border-2 border-primary/20">
        <CardHeader className="bg-primary/5">
          <CardTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5" />
            Weight Capture Station
          </CardTitle>
          <CardDescription>Current vehicle on weighbridge</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Skeleton className="h-48 rounded-xl" />
              <Skeleton className="h-48 rounded-xl" />
            </div>
          ) : currentTrip ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Weight Display */}
              <div className="text-center p-8 rounded-xl bg-muted/50 border">
                <p className="text-sm text-muted-foreground mb-2">Current Weight Reading</p>
                <p className="weight-display text-primary">
                  {currentTrip.gross_weight?.toLocaleString() || '---'}
                </p>
                <p className="weight-unit text-muted-foreground">kg</p>
                <div className="flex items-center justify-center gap-2 mt-4">
                  <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
                  <span className="text-sm text-success">Scale Connected</span>
                </div>
              </div>

              {/* Trip Info */}
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-muted/30 border">
                  <p className="text-sm text-muted-foreground">Current Trip</p>
                  <p className="text-lg font-semibold">TRP-{currentTrip.id.toString().padStart(4, '0')}</p>
                  <div className="mt-2 space-y-1 text-sm">
                    <p><span className="text-muted-foreground">Vehicle ID:</span> {currentTrip.vehicle_id}</p>
                    <p><span className="text-muted-foreground">Driver ID:</span> {currentTrip.driver_id}</p>
                    <p><span className="text-muted-foreground">PO ID:</span> {currentTrip.po_id}</p>
                    <p><span className="text-muted-foreground">Stage:</span> {currentTrip.current_stage.replace('_', ' ')}</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button className="flex-1 gap-2" size="lg">
                    <CheckCircle className="h-5 w-5" />
                    Capture Weight
                  </Button>
                  <Button variant="outline" size="lg" onClick={() => refetch()}>
                    <RefreshCw className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Scale className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No vehicle currently on weighbridge</p>
              <p className="text-sm">Waiting for next trip...</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Active Trips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Route className="h-5 w-5" />
            Active Trips Queue
          </CardTitle>
          <CardDescription>Trips awaiting weight capture or verification</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-28 rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {data.activeTrips.map((trip, i) => (
                <div
                  key={trip.id}
                  className={`p-4 rounded-lg border transition-all ${
                    i === 0 ? 'border-primary bg-primary/5' : 'bg-muted/30 hover:bg-muted/50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">TRP-{trip.id.toString().padStart(4, '0')}</p>
                        {i === 0 && (
                          <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                            Current
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Vehicle: {trip.vehicle_id} • PO: {trip.po_id}
                      </p>
                    </div>
                    <StatusBadge status="active" />
                  </div>
                  <TripStageProgress currentStage={trip.current_stage as TripStage} />
                  {i === 0 && (
                    <div className="flex gap-2 mt-4">
                      <Button size="sm" className="gap-1">
                        <Play className="h-3 w-3" />
                        Process
                      </Button>
                      <Button size="sm" variant="outline">
                        View Details
                      </Button>
                    </div>
                  )}
                </div>
              ))}
              {data.activeTrips.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Route className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No active trips in queue</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
