import { StatsCard } from '@/components/dashboard/widgets/StatsCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StatusBadge } from '@/components/common/StatusBadge';
import { 
  Car, 
  ShieldCheck, 
  FileSearch, 
  Clock,
  Search,
  CheckCircle,
  XCircle,
  Eye,
  Plus,
  LogIn,
  LogOut,
} from 'lucide-react';

export default function SecurityDashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Security Dashboard</h1>
          <p className="text-muted-foreground">
            Gate operations, vehicle registration, and PO verification
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Register Vehicle
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Vehicles Today"
          value={34}
          icon={Car}
          variant="primary"
        />
        <StatsCard
          title="Gate Entries"
          value={28}
          icon={LogIn}
          variant="success"
        />
        <StatsCard
          title="Gate Exits"
          value={22}
          icon={LogOut}
          variant="info"
        />
        <StatsCard
          title="Pending Verification"
          value={6}
          icon={Clock}
          variant="warning"
        />
      </div>

      {/* PO Verification Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSearch className="h-5 w-5" />
            PO Verification
          </CardTitle>
          <CardDescription>Verify purchase order before vehicle entry</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Enter PO reference number (e.g., PO-2024-0155)"
                className="pl-10"
              />
            </div>
            <Button>Verify PO</Button>
          </div>

          {/* Mock verified PO */}
          <div className="p-4 rounded-lg border bg-success/5 border-success/20">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-success" />
                  <span className="font-semibold text-success">PO Verified</span>
                </div>
                <p className="font-medium">PO-2024-0155</p>
                <p className="text-sm text-muted-foreground">
                  Seller: Steel Corp Ltd • Material: Iron Ore
                </p>
                <p className="text-sm text-muted-foreground">
                  Valid until: 31 Jan 2026 • Remaining qty: 450 MT
                </p>
              </div>
              <Button size="sm">Create Trip</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Vehicle Verifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5" />
              Pending Verifications
            </CardTitle>
            <CardDescription>Vehicles awaiting approval</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { reg: 'MH 12 AB 1234', type: 'Truck', tare: '12,500 kg', time: '5 min ago' },
              { reg: 'GJ 05 CD 5678', type: 'Trailer', tare: '8,200 kg', time: '12 min ago' },
              { reg: 'RJ 14 EF 9012', type: 'Truck', tare: '15,000 kg', time: '25 min ago' },
            ].map((vehicle, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center">
                    <Car className="h-5 w-5 text-warning" />
                  </div>
                  <div>
                    <p className="font-medium">{vehicle.reg}</p>
                    <p className="text-xs text-muted-foreground">
                      {vehicle.type} • Tare: {vehicle.tare} • {vehicle.time}
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
          </CardContent>
        </Card>

        {/* Recent Vehicles */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Recent Vehicles
            </CardTitle>
            <CardDescription>Last 10 vehicles at the gate</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { reg: 'MH 14 GH 3456', action: 'Entry', time: '2 min ago', status: 'approved' },
              { reg: 'GJ 01 IJ 7890', action: 'Exit', time: '8 min ago', status: 'completed' },
              { reg: 'RJ 19 KL 2345', action: 'Entry', time: '15 min ago', status: 'approved' },
              { reg: 'MP 04 MN 6789', action: 'Exit', time: '22 min ago', status: 'completed' },
              { reg: 'UP 32 OP 0123', action: 'Entry', time: '35 min ago', status: 'approved' },
            ].map((vehicle, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                    vehicle.action === 'Entry' ? 'bg-success/10' : 'bg-info/10'
                  }`}>
                    {vehicle.action === 'Entry' ? (
                      <LogIn className={`h-4 w-4 text-success`} />
                    ) : (
                      <LogOut className={`h-4 w-4 text-info`} />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{vehicle.reg}</p>
                    <p className="text-xs text-muted-foreground">{vehicle.time}</p>
                  </div>
                </div>
                <StatusBadge status={vehicle.status as any} />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
