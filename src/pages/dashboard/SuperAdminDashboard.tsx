import { StatsCard } from '@/components/dashboard/widgets/StatsCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Truck, 
  Car, 
  FileText, 
  Route, 
  Scale,
  Activity,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
  BarChart3,
} from 'lucide-react';

export default function SuperAdminDashboard() {
  return (
    <div className="space-y-6">
      {/* Welcome section */}
      <div>
        <h1 className="text-2xl font-bold">System Overview</h1>
        <p className="text-muted-foreground">
          Monitor all weighbridge operations and system metrics
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Active Trips"
          value={24}
          icon={Route}
          variant="primary"
          trend={{ value: 12, isPositive: true }}
        />
        <StatsCard
          title="Total Staff"
          value={48}
          icon={Users}
          variant="info"
          description="Across all departments"
        />
        <StatsCard
          title="Pending Approvals"
          value={8}
          icon={Clock}
          variant="warning"
          description="Drivers & Vehicles"
        />
        <StatsCard
          title="Today's Weight"
          value="1,284 MT"
          icon={Scale}
          variant="success"
          trend={{ value: 8, isPositive: true }}
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard
          title="Active Drivers"
          value={32}
          icon={Truck}
          description="Currently approved"
        />
        <StatsCard
          title="Registered Vehicles"
          value={56}
          icon={Car}
          description="In the system"
        />
        <StatsCard
          title="Active POs"
          value={18}
          icon={FileText}
          description="Currently open"
        />
      </div>

      {/* Charts & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weight Trend Chart Placeholder */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Weekly Weight Trends
            </CardTitle>
            <CardDescription>
              Total material weight processed per day
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-muted/30 rounded-lg border border-dashed">
              <div className="text-center text-muted-foreground">
                <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Weight trend chart</p>
                <p className="text-xs">Connect to API for live data</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>Latest system events</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { action: 'Trip completed', time: '2 min ago', type: 'success' },
              { action: 'New driver registered', time: '15 min ago', type: 'info' },
              { action: 'Weight variance alert', time: '32 min ago', type: 'warning' },
              { action: 'PO validated', time: '1 hour ago', type: 'success' },
              { action: 'Vehicle approved', time: '2 hours ago', type: 'info' },
            ].map((activity, i) => (
              <div key={i} className="flex items-start gap-3">
                <div
                  className={`h-2 w-2 rounded-full mt-2 ${
                    activity.type === 'success'
                      ? 'bg-success'
                      : activity.type === 'warning'
                      ? 'bg-warning'
                      : 'bg-info'
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{activity.action}</p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common administrative tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" className="gap-2">
              <Users className="h-4 w-4" />
              Add Staff
            </Button>
            <Button variant="outline" className="gap-2">
              <FileText className="h-4 w-4" />
              Create PO
            </Button>
            <Button variant="outline" className="gap-2">
              <CheckCircle className="h-4 w-4" />
              Review Approvals
            </Button>
            <Button variant="outline" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              View Reports
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
