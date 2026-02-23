import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { LayoutDashboard, Palette, Users, FolderKanban, Rocket, AlertTriangle, Plus, Store } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/axios';
import { format } from 'date-fns';

export function DashboardPage() {
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const res = await api.get('/dashboard/stats');
      return res.data.data;
    },
  });

  const { data: expiringDomains } = useQuery({
    queryKey: ['expiring-domains'],
    queryFn: async () => {
      const res = await api.get('/domain-records?status=EXPIRING_SOON&limit=5');
      return res.data.data ?? [];
    },
  });

  const { data: recentDeployments } = useQuery({
    queryKey: ['recent-deployments'],
    queryFn: async () => {
      const res = await api.get('/activity-logs?action=deployment&limit=5');
      return res.data.data ?? [];
    },
  });

  const { data: deployedCount } = useQuery({
    queryKey: ['deployed-count'],
    queryFn: async () => {
      const res = await api.get('/projects?status=DEPLOYED&limit=1');
      return res.data.meta?.total ?? 0;
    },
  });

  if (isLoading) {
    return <div className="text-muted-foreground">Loading...</div>;
  }

  const stats = [
    { label: 'Templates', value: data?.totalTemplates ?? 0, icon: Palette, color: 'text-blue-600' },
    { label: 'Clients', value: data?.totalClients ?? 0, icon: Users, color: 'text-green-600' },
    { label: 'Projects', value: data?.totalProjects ?? 0, icon: FolderKanban, color: 'text-purple-600' },
    { label: 'Active Projects', value: data?.activeProjects ?? 0, icon: LayoutDashboard, color: 'text-orange-600' },
    { label: 'Deployed', value: deployedCount ?? 0, icon: Rocket, color: 'text-teal-600' },
  ];

  const deployStatusColor = (status: string) => {
    if (status === 'SUCCESS') return 'text-green-600';
    if (status === 'FAILED') return 'text-red-600';
    return 'text-yellow-600';
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* Domain Expiry Alert */}
      {(expiringDomains ?? []).length > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                {expiringDomains.length} domain(s) expiring soon
              </p>
              <div className="mt-1 space-y-0.5">
                {expiringDomains.map((d: any) => (
                  <p key={d.id} className="text-xs text-amber-700 dark:text-amber-400">
                    <span className="font-medium">{d.domain}</span>
                    {d.expiresAt && ` — expires ${format(new Date(d.expiresAt), 'MMM d, yyyy')}`}
                  </p>
                ))}
              </div>
              <Button variant="link" size="sm" className="h-auto p-0 mt-1 text-amber-700 dark:text-amber-400" onClick={() => navigate('/domains')}>
                Manage domains →
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={() => navigate('/projects')}>
              <Plus className="h-4 w-4 mr-1" /> New Project
            </Button>
            <Button size="sm" variant="outline" onClick={() => navigate('/templates')}>
              <Palette className="h-4 w-4 mr-1" /> Add Template
            </Button>
            <Button size="sm" variant="outline" onClick={() => navigate('/marketplace')}>
              <Store className="h-4 w-4 mr-1" /> Browse Marketplace
            </Button>
            <Button size="sm" variant="outline" onClick={() => navigate('/clients')}>
              <Users className="h-4 w-4 mr-1" /> Add Client
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {data?.recentActivity?.length ? (
              <div className="space-y-3">
                {data.recentActivity.map((log: any) => (
                  <div key={log.id} className="flex items-center gap-3 text-sm">
                    <Badge variant="outline" className="shrink-0">
                      {log.action}
                    </Badge>
                    <span className="text-muted-foreground truncate">{log.details}</span>
                    <span className="ml-auto text-xs text-muted-foreground shrink-0">
                      {new Date(log.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No recent activity</p>
            )}
          </CardContent>
        </Card>

        {/* Recent Deployments */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Deployments</CardTitle>
          </CardHeader>
          <CardContent>
            {(recentDeployments ?? []).length ? (
              <div className="space-y-3">
                {recentDeployments.map((log: any) => (
                  <div key={log.id} className="flex items-center gap-3 text-sm">
                    <Rocket className={`h-4 w-4 shrink-0 ${deployStatusColor(log.action)}`} />
                    <span className="text-muted-foreground truncate">{log.details}</span>
                    <span className="ml-auto text-xs text-muted-foreground shrink-0">
                      {new Date(log.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No deployments yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
