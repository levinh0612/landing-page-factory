import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Database, Download, Upload, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import api from '@/lib/axios';

export function ToolsPage() {
  const [healthResult, setHealthResult] = useState<{ db: boolean; api: boolean; dbLatencyMs: number | null } | null>(null);

  const healthMutation = useMutation({
    mutationFn: async () => {
      try {
        const res = await api.get('/monitor/system');
        const d = res.data.data;
        return { api: true, db: d.db === true, dbLatencyMs: d.dbLatencyMs ?? null };
      } catch {
        return { api: false, db: false, dbLatencyMs: null };
      }
    },
    onSuccess: (result) => {
      setHealthResult(result);
      toast.success('Health check complete');
    },
  });

  const exportMutation = useMutation({
    mutationFn: async () => {
      const [clients, projects] = await Promise.all([
        api.get('/clients?limit=1000'),
        api.get('/projects?limit=1000'),
      ]);
      return { clients: clients.data.data, projects: projects.data.data, exportedAt: new Date().toISOString() };
    },
    onSuccess: (data) => {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `lpf-export-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Export complete');
    },
    onError: () => toast.error('Export failed'),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Tools</h1>
        <p className="text-muted-foreground">Utility tools for managing your platform</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Site Health */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Database className="h-5 w-5" /> Site Health
            </CardTitle>
            <CardDescription>Check connectivity and service health</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {healthResult && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  {healthResult.api ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span>API Server</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  {healthResult.db ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span>Database</span>
                  {healthResult.dbLatencyMs !== null && (
                    <span className="ml-auto text-xs text-muted-foreground">{healthResult.dbLatencyMs}ms</span>
                  )}
                </div>
              </div>
            )}
            <Button
              onClick={() => healthMutation.mutate()}
              disabled={healthMutation.isPending}
              size="sm"
              className="w-full"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${healthMutation.isPending ? 'animate-spin' : ''}`} />
              Run Health Check
            </Button>
          </CardContent>
        </Card>

        {/* Export */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Download className="h-5 w-5" /> Export Data
            </CardTitle>
            <CardDescription>Download all platform data as JSON</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => exportMutation.mutate()}
              disabled={exportMutation.isPending}
              size="sm"
              className="w-full"
              variant="outline"
            >
              <Download className="h-4 w-4 mr-2" />
              {exportMutation.isPending ? 'Exporting...' : 'Export JSON'}
            </Button>
          </CardContent>
        </Card>

        {/* Import */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Upload className="h-5 w-5" /> Import Data
            </CardTitle>
            <CardDescription>Restore from a previously exported JSON file</CardDescription>
          </CardHeader>
          <CardContent>
            <Button size="sm" className="w-full" variant="outline" disabled>
              <Upload className="h-4 w-4 mr-2" /> Import JSON
            </Button>
            <p className="text-xs text-muted-foreground mt-2">Coming soon</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
