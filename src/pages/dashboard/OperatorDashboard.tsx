import { StatsCard } from '@/components/dashboard/widgets/StatsCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/common/StatusBadge';
import { TripStageProgress } from '@/components/common/TripStageProgress';
import { 
  Scale, 
  Route, 
  Package,
  CheckCircle,
  AlertCircle,
  Play,
  Pause,
  RefreshCw,
} from 'lucide-react';

export default function OperatorDashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Operator Dashboard</h1>
        <p className="text-muted-foreground">
          Weight capture, trip progression, and quality verification
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Active Trips"
          value={6}
          icon={Route}
          variant="primary"
        />
        <StatsCard
          title="Weights Captured"
          value={42}
          icon={Scale}
          variant="success"
          description="Today"
        />
        <StatsCard
          title="Quality Checks"
          value={38}
          icon={CheckCircle}
          variant="info"
          description="Today"
        />
        <StatsCard
          title="Pending Unloads"
          value={4}
          icon={Package}
          variant="warning"
        />
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Weight Display */}
            <div className="text-center p-8 rounded-xl bg-muted/50 border">
              <p className="text-sm text-muted-foreground mb-2">Current Weight Reading</p>
              <p className="weight-display text-primary">24,580</p>
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
                <p className="text-lg font-semibold">TRP-2024-0892</p>
                <div className="mt-2 space-y-1 text-sm">
                  <p><span className="text-muted-foreground">Vehicle:</span> MH 14 CD 5678</p>
                  <p><span className="text-muted-foreground">Driver:</span> Suresh Patil</p>
                  <p><span className="text-muted-foreground">PO:</span> PO-2024-0155</p>
                  <p><span className="text-muted-foreground">Material:</span> Iron Ore</p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button className="flex-1 gap-2" size="lg">
                  <CheckCircle className="h-5 w-5" />
                  Capture Weight
                </Button>
                <Button variant="outline" size="lg">
                  <RefreshCw className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
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
          <div className="space-y-4">
            {[
              { id: 'TRP-0892', vehicle: 'MH 14 CD 5678', stage: 'GROSS_WEIGHT' as const, material: 'Iron Ore', status: 'active' },
              { id: 'TRP-0891', vehicle: 'GJ 05 EF 9012', stage: 'UNLOADING' as const, material: 'Copper Scrap', status: 'active' },
              { id: 'TRP-0890', vehicle: 'RJ 27 GH 3456', stage: 'TARE_WEIGHT' as const, material: 'Coal', status: 'active' },
              { id: 'TRP-0889', vehicle: 'MP 09 IJ 7890', stage: 'ENTRY_GATE' as const, material: 'Limestone', status: 'pending' },
            ].map((trip, i) => (
              <div
                key={i}
                className={`p-4 rounded-lg border transition-all ${
                  i === 0 ? 'border-primary bg-primary/5' : 'bg-muted/30 hover:bg-muted/50'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{trip.id}</p>
                      {i === 0 && (
                        <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                          Current
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {trip.vehicle} • {trip.material}
                    </p>
                  </div>
                  <StatusBadge status={trip.status as any} />
                </div>
                <TripStageProgress currentStage={trip.stage} />
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
