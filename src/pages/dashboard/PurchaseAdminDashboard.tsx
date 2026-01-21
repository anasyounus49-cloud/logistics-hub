import { StatsCard } from '@/components/dashboard/widgets/StatsCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/common/StatusBadge';
import { TripStageProgress } from '@/components/common/TripStageProgress';
import { 
  FileText, 
  Package, 
  Truck, 
  Car,
  Route,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
} from 'lucide-react';

export default function PurchaseAdminDashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Purchase Dashboard</h1>
          <p className="text-muted-foreground">
            Manage purchase orders, approvals, and trip monitoring
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Create PO
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Active POs"
          value={12}
          icon={FileText}
          variant="primary"
        />
        <StatsCard
          title="Pending Drivers"
          value={5}
          icon={Truck}
          variant="warning"
        />
        <StatsCard
          title="Pending Vehicles"
          value={3}
          icon={Car}
          variant="warning"
        />
        <StatsCard
          title="Active Trips"
          value={8}
          icon={Route}
          variant="info"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Approvals */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Pending Approvals
            </CardTitle>
            <CardDescription>Drivers and vehicles awaiting approval</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { type: 'Driver', name: 'John Smith', id: 'DRV-001', mobile: '+91 98765 43210' },
              { type: 'Driver', name: 'Rajesh Kumar', id: 'DRV-002', mobile: '+91 87654 32109' },
              { type: 'Vehicle', name: 'MH 12 AB 1234', id: 'VEH-001', weight: '12,500 kg' },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center">
                    {item.type === 'Driver' ? (
                      <Truck className="h-5 w-5 text-warning" />
                    ) : (
                      <Car className="h-5 w-5 text-warning" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.id} • {item.mobile || item.weight}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" className="text-success hover:text-success hover:bg-success/10">
                    <CheckCircle className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                    <XCircle className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            <Button variant="outline" className="w-full">
              View All Approvals
            </Button>
          </CardContent>
        </Card>

        {/* Active Trips */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Route className="h-5 w-5" />
              Active Trip Monitoring
            </CardTitle>
            <CardDescription>Real-time trip status tracking</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { id: 'TRP-001', vehicle: 'MH 14 CD 5678', stage: 'GROSS_WEIGHT' as const, po: 'PO-2024-0152' },
              { id: 'TRP-002', vehicle: 'GJ 05 EF 9012', stage: 'UNLOADING' as const, po: 'PO-2024-0148' },
              { id: 'TRP-003', vehicle: 'RJ 27 GH 3456', stage: 'ENTRY_GATE' as const, po: 'PO-2024-0155' },
            ].map((trip, i) => (
              <div key={i} className="p-4 rounded-lg bg-muted/30 border space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{trip.vehicle}</p>
                    <p className="text-xs text-muted-foreground">
                      {trip.id} • {trip.po}
                    </p>
                  </div>
                  <StatusBadge status="active" />
                </div>
                <TripStageProgress currentStage={trip.stage} />
              </div>
            ))}
            <Button variant="outline" className="w-full">
              View All Trips
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent POs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Recent Purchase Orders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { ref: 'PO-2024-0155', seller: 'Steel Corp Ltd', material: 'Iron Ore', status: 'Active' },
              { ref: 'PO-2024-0154', seller: 'Metro Metals', material: 'Copper Scrap', status: 'Active' },
              { ref: 'PO-2024-0153', seller: 'National Resources', material: 'Coal', status: 'Active' },
              { ref: 'PO-2024-0150', seller: 'Gujarat Mining', material: 'Limestone', status: 'Closed' },
            ].map((po, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Package className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{po.ref}</p>
                    <p className="text-xs text-muted-foreground">
                      {po.seller} • {po.material}
                    </p>
                  </div>
                </div>
                <StatusBadge status={po.status.toLowerCase() as any} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
