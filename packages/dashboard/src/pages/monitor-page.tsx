import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Activity, Server, RefreshCw, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import api from '@/lib/axios';

function formatUptime(seconds: number) {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

const HEALTH_COLORS: Record<string, string> = {
  HEALTHY: 'bg-green-100 text-green-800',
  DEGRADED: 'bg-yellow-100 text-yellow-800',
  DOWN: 'bg-red-100 text-red-800',
  UNKNOWN: 'bg-gray-100 text-gray-800',
};

export function MonitorPage() {
  const queryClient = useQueryClient();

  const { data: systemData, isLoading: systemLoading } = useQuery({
    queryKey: ['monitor-system'],
    queryFn: () => api.get('/monitor/system').then((r) => r.data.data),
    refetchInterval: 30000,
  });

  const { data: projectsData, isLoading: projectsLoading } = useQuery({
    queryKey: ['monitor-projects'],
    queryFn: () => api.get('/monitor/projects').then((r) => r.data.data),
    refetchInterval: 30000,
  });

  const pingMutation = useMutation({
    mutationFn: (id: string) => api.post(`/monitor/projects/${id}/ping`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monitor-projects'] });
      toast.success('Ping completed');
    },
    onError: () => toast.error('Ping failed'),
  });

  const projects = projectsData ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Monitor</h1>
          <p className="text-muted-foreground">System health and project uptime monitoring</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            queryClient.invalidateQueries({ queryKey: ['monitor-system'] });
            queryClient.invalidateQueries({ queryKey: ['monitor-projects'] });
          }}
        >
          <RefreshCw className="h-4 w-4 mr-2" /> Refresh
        </Button>
      </div>

      {/* System Health */}
      {systemLoading ? (
        <div className="text-center py-6 text-muted-foreground">Loading system info...</div>
      ) : systemData ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Activity className="h-4 w-4" /> Uptime
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{formatUptime(systemData.uptime)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Server className="h-4 w-4" /> Memory (Heap)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{systemData.memory.heapUsed} MB</p>
              <p className="text-xs text-muted-foreground">of {systemData.memory.heapTotal} MB</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Node Version</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{systemData.nodeVersion}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">RSS Memory</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{systemData.memory.rss} MB</p>
              <p className="text-xs text-muted-foreground">Resident Set Size</p>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {/* Projects Health */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Project Health</h2>
        {projectsLoading ? (
          <div className="text-center py-6 text-muted-foreground">Loading...</div>
        ) : (
          <div className="overflow-x-auto"><div className="border rounded-lg overflow-hidden min-w-[700px]">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-3 font-medium">Project</th>
                  <th className="text-left p-3 font-medium">URL</th>
                  <th className="text-left p-3 font-medium">Status</th>
                  <th className="text-left p-3 font-medium">Response Time</th>
                  <th className="text-left p-3 font-medium">Last Check</th>
                  <th className="p-3" />
                </tr>
              </thead>
              <tbody className="divide-y">
                {projects.map((project: any) => {
                  const lastCheck = project.healthChecks?.[0];
                  const status = lastCheck?.status ?? 'UNKNOWN';
                  return (
                    <tr key={project.id} className="hover:bg-muted/30">
                      <td className="p-3 font-medium">{project.name}</td>
                      <td className="p-3">
                        <a href={project.deployUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-xs truncate max-w-[200px] block">
                          {project.deployUrl}
                        </a>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${HEALTH_COLORS[status]}`}>
                          {status}
                        </span>
                      </td>
                      <td className="p-3 text-muted-foreground">
                        {lastCheck?.responseTimeMs ? `${lastCheck.responseTimeMs}ms` : '—'}
                      </td>
                      <td className="p-3 text-muted-foreground text-xs">
                        {lastCheck ? format(new Date(lastCheck.checkedAt), 'MMM d HH:mm') : 'Never'}
                      </td>
                      <td className="p-3">
                        <Button
                          variant="ghost" size="sm"
                          onClick={() => pingMutation.mutate(project.id)}
                          disabled={pingMutation.isPending}
                        >
                          <Zap className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
                {projects.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-muted-foreground">
                      No deployed projects found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div></div>
        )}
      </div>
    </div>
  );
}
