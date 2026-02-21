import { useQuery } from '@tanstack/react-query';
import { LayoutDashboard, Palette, Users, FolderKanban } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/axios';

export function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const res = await api.get('/dashboard/stats');
      return res.data.data;
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
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
                  <span className="text-muted-foreground">{log.details}</span>
                  <span className="ml-auto text-xs text-muted-foreground">
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
    </div>
  );
}
