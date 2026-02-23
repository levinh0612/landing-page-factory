import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Globe, Calendar, User, Layout, Save, ExternalLink, Share2, Rocket, FileText, Activity, Check, X, Plus, Trash2, RefreshCw, ShieldCheck, ShieldAlert, Puzzle } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { api } from '@/lib/axios';
import { Input } from '@/components/ui/input';
import { ConfigEditor } from '@/components/config-editor';
import { PreviewLinkDialog } from '@/components/preview-link-dialog';
import { CommentThread } from '@/components/comment-thread';
import { DeployDialog } from '@/components/deploy-dialog';
import { DeploymentLogsDialog } from '@/components/deployment-logs-dialog';
import type { TemplateConfigSchema, Plugin, ProjectPlugin } from '@lpf/shared';
import { Switch } from '@/components/ui/switch';

const statusVariant = (status: string) => {
  switch (status) {
    case 'DEPLOYED': return 'default' as const;
    case 'IN_PROGRESS': return 'secondary' as const;
    case 'READY': return 'outline' as const;
    case 'ARCHIVED': return 'destructive' as const;
    default: return 'outline' as const;
  }
};

const approvalVariant = (status: string) => {
  switch (status) {
    case 'APPROVED': return 'default' as const;
    case 'CHANGES_REQUESTED': return 'destructive' as const;
    default: return 'secondary' as const;
  }
};

const deployStatusVariant = (status: string) => {
  switch (status) {
    case 'SUCCESS': return 'default' as const;
    case 'PENDING': case 'BUILDING': return 'secondary' as const;
    case 'FAILED': return 'destructive' as const;
    default: return 'outline' as const;
  }
};

const healthStatusVariant = (status: string) => {
  switch (status) {
    case 'HEALTHY': return 'default' as const;
    case 'DEGRADED': return 'secondary' as const;
    case 'DOWN': return 'destructive' as const;
    default: return 'outline' as const;
  }
};

export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [config, setConfig] = useState<Record<string, unknown>>({});
  const [configDirty, setConfigDirty] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showDeployDialog, setShowDeployDialog] = useState(false);
  const [selectedDeployment, setSelectedDeployment] = useState<any>(null);
  const [addingDomain, setAddingDomain] = useState(false);
  const [newDomainValue, setNewDomainValue] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['project', id],
    queryFn: async () => {
      const res = await api.get(`/projects/${id}`);
      return res.data.data;
    },
    enabled: !!id,
  });

  // Initialize config from project data
  useEffect(() => {
    if (data?.config && typeof data.config === 'object') {
      setConfig(data.config as Record<string, unknown>);
    }
  }, [data?.config]);

  const configSchema = data?.template?.configSchema as TemplateConfigSchema | null;

  const saveConfigMutation = useMutation({
    mutationFn: (newConfig: Record<string, unknown>) =>
      api.patch(`/projects/${id}`, { config: newConfig }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', id] });
      setConfigDirty(false);
      toast.success('Configuration saved');
    },
    onError: () => toast.error('Failed to save configuration'),
  });

  const handleConfigChange = (newConfig: Record<string, unknown>) => {
    setConfig(newConfig);
    setConfigDirty(true);
  };

  const handleSaveConfig = () => {
    saveConfigMutation.mutate(config);
  };

  const pingMutation = useMutation({
    mutationFn: () => api.post(`/monitor/projects/${id}/ping`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', id] });
      toast.success('Health check completed');
    },
    onError: () => toast.error('Health check failed'),
  });

  const { data: vercelDomains, isLoading: domainsLoading, refetch: refetchDomains } = useQuery<
    Array<{ name: string; verified: boolean; createdAt: number }>
  >({
    queryKey: ['vercel-domains', id],
    queryFn: async () => {
      const res = await api.get(`/projects/${id}/vercel-domains`);
      return res.data.data;
    },
    enabled: !!id && !!data?.deployUrl, // only fetch if project has been deployed
    retry: false,
  });

  const addDomainMutation = useMutation({
    mutationFn: (domain: string) => api.post(`/projects/${id}/vercel-domains`, { domain }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vercel-domains', id] });
      queryClient.invalidateQueries({ queryKey: ['project', id] });
      setAddingDomain(false);
      setNewDomainValue('');
      toast.success('Domain added to Vercel');
    },
    onError: (err: any) => toast.error(err?.response?.data?.error || 'Failed to add domain'),
  });

  const removeDomainMutation = useMutation({
    mutationFn: (domain: string) => api.delete(`/projects/${id}/vercel-domains/${encodeURIComponent(domain)}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vercel-domains', id] });
      queryClient.invalidateQueries({ queryKey: ['project', id] });
      toast.success('Domain removed');
    },
    onError: () => toast.error('Failed to remove domain'),
  });

  // Plugin management
  const { data: allPlugins } = useQuery<Plugin[]>({
    queryKey: ['plugins'],
    queryFn: async () => (await api.get('/plugins')).data.data,
  });

  const { data: projectPluginData, refetch: refetchProjectPlugins } = useQuery<ProjectPlugin[]>({
    queryKey: ['project-plugins', id],
    queryFn: async () => (await api.get(`/projects/${id}/plugins`)).data.data,
    enabled: !!id,
  });

  const updatePluginsMutation = useMutation({
    mutationFn: (plugins: Array<{ pluginId: string; enabled: boolean }>) =>
      api.put(`/projects/${id}/plugins`, { plugins }),
    onSuccess: () => {
      refetchProjectPlugins();
      toast.success('Plugins updated');
    },
    onError: () => toast.error('Failed to update plugins'),
  });

  const projectPluginMap = new Map(
    (projectPluginData ?? []).map((pp) => [pp.pluginId, pp]),
  );

  const togglePlugin = (pluginId: string, enabled: boolean) => {
    updatePluginsMutation.mutate([{ pluginId, enabled }]);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-4">
        <Link to="/projects">
          <Button variant="ghost" size="sm"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Projects</Button>
        </Link>
        <p className="text-muted-foreground">Project not found.</p>
      </div>
    );
  }

  const project = data;
  const hasTemplateFiles = project.template?.filePath && project.template?.version > 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/projects">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{project.name}</h1>
          <p className="text-sm text-muted-foreground">{project.slug}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={approvalVariant(project.approvalStatus)}>
            {(project.approvalStatus || 'PENDING').replace('_', ' ')}
          </Badge>
          <Badge variant={statusVariant(project.status)}>
            {project.status.replace('_', ' ')}
          </Badge>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowShareDialog(true)}>
            <Share2 className="mr-1 h-4 w-4" /> Share
          </Button>
          <Button size="sm" onClick={() => setShowDeployDialog(true)}>
            <Rocket className="mr-1 h-4 w-4" /> Deploy
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          {configSchema && <TabsTrigger value="config">Configuration</TabsTrigger>}
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="comments">Comments</TabsTrigger>
          <TabsTrigger value="deployments">Deployments</TabsTrigger>
          <TabsTrigger value="health">Health</TabsTrigger>
          <TabsTrigger value="plugins">Plugins</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 mt-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Card className="sm:col-span-2 lg:col-span-1">
              <CardHeader className="flex flex-row items-center gap-2 pb-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-sm font-medium">Domains</CardTitle>
                <div className="ml-auto flex gap-1">
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => refetchDomains()} title="Refresh">
                    <RefreshCw className="h-3 w-3" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => { setNewDomainValue(''); setAddingDomain(true); }} title="Add domain">
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {/* Raw deploy URL always shown */}
                {project.deployUrl && (
                  <a href={project.deployUrl} target="_blank" rel="noreferrer"
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary hover:underline truncate">
                    {project.deployUrl} <ExternalLink className="h-3 w-3 shrink-0" />
                  </a>
                )}

                {/* Vercel domains list */}
                {domainsLoading ? (
                  <p className="text-xs text-muted-foreground">Loading domains…</p>
                ) : vercelDomains && vercelDomains.length > 0 ? (
                  <div className="space-y-1">
                    {vercelDomains.map((d) => (
                      <div key={d.name} className="flex items-center gap-2 group">
                        {d.verified
                          ? <ShieldCheck className="h-3.5 w-3.5 text-green-500 shrink-0" />
                          : <ShieldAlert className="h-3.5 w-3.5 text-yellow-500 shrink-0" />}
                        <a href={`https://${d.name}`} target="_blank" rel="noreferrer"
                          className="text-sm font-medium hover:underline flex-1 truncate">
                          {d.name}
                        </a>
                        <Button
                          variant="ghost" size="icon" className="h-5 w-5 opacity-0 group-hover:opacity-100 text-destructive"
                          onClick={() => removeDomainMutation.mutate(d.name)}
                          disabled={removeDomainMutation.isPending}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : !project.deployUrl ? (
                  <p className="text-xs text-muted-foreground">Deploy first to manage domains.</p>
                ) : null}

                {/* Add domain inline form */}
                {addingDomain && (
                  <div className="flex gap-1 pt-1">
                    <Input
                      value={newDomainValue}
                      onChange={(e) => setNewDomainValue(e.target.value)}
                      placeholder="e.g. mysite.com"
                      className="h-7 text-xs"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && newDomainValue) addDomainMutation.mutate(newDomainValue);
                        if (e.key === 'Escape') setAddingDomain(false);
                      }}
                    />
                    <Button size="sm" className="h-7 px-2 shrink-0"
                      onClick={() => newDomainValue && addDomainMutation.mutate(newDomainValue)}
                      disabled={addDomainMutation.isPending || !newDomainValue}>
                      <Check className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 px-2 shrink-0" onClick={() => setAddingDomain(false)}>
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center gap-2 pb-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-sm font-medium">Client</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-semibold">{project.client?.name || '-'}</p>
                {project.client?.email && (
                  <p className="text-xs text-muted-foreground">{project.client.email}</p>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center gap-2 pb-2">
                <Layout className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-sm font-medium">Template</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-semibold">{project.template?.name || '-'}</p>
                {project.template?.category && (
                  <p className="text-xs text-muted-foreground">
                    {project.template.category}
                    {project.template.version > 0 && (
                      <span className="ml-2">v{project.template.version}</span>
                    )}
                  </p>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center gap-2 pb-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-sm font-medium">Created</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-semibold">
                  {new Date(project.createdAt).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center gap-2 pb-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-sm font-medium">Last Updated</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-semibold">
                  {new Date(project.updatedAt).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
            {project.deployTarget && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Deploy Target</CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge variant="outline">{project.deployTarget}</Badge>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {configSchema && (
          <TabsContent value="config" className="mt-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Project Configuration</CardTitle>
                  <div className="flex items-center gap-2">
                    {configDirty && (
                      <span className="text-xs text-muted-foreground">Unsaved changes</span>
                    )}
                    <Button
                      size="sm"
                      onClick={handleSaveConfig}
                      disabled={!configDirty || saveConfigMutation.isPending}
                    >
                      <Save className="mr-2 h-4 w-4" />
                      {saveConfigMutation.isPending ? 'Saving...' : 'Save'}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ConfigEditor
                  configSchema={configSchema}
                  config={config}
                  onChange={handleConfigChange}
                />
              </CardContent>
            </Card>
          </TabsContent>
        )}

        <TabsContent value="preview" className="mt-4">
          {hasTemplateFiles ? (
            <div className="space-y-3">
              <div className="flex items-center justify-end">
                <Button variant="outline" size="sm" asChild>
                  <a
                    href={`/api/projects/${project.id}/preview`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Open in New Tab
                  </a>
                </Button>
              </div>
              <div className="overflow-hidden rounded-lg border bg-white">
                <iframe
                  src={`/api/projects/${project.id}/preview`}
                  className="h-[600px] w-full"
                  title="Project Preview"
                />
              </div>
            </div>
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No template files uploaded yet. Upload a ZIP file to the template to enable preview.
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="comments" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Comments</CardTitle>
            </CardHeader>
            <CardContent>
              <CommentThread projectId={project.id} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deployments" className="mt-4">
          <div className="space-y-4">
            <div className="flex justify-end">
              <Button size="sm" onClick={() => setShowDeployDialog(true)}>
                <Rocket className="mr-2 h-4 w-4" /> Deploy Now
              </Button>
            </div>
            {project.deployments?.length ? (
              <div className="overflow-x-auto rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Version</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Platform</TableHead>
                      <TableHead>Build Time</TableHead>
                      <TableHead>URL</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Logs</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {project.deployments.map((d: any) => (
                      <TableRow key={d.id}>
                        <TableCell className="font-mono text-sm">{d.version}</TableCell>
                        <TableCell>
                          <Badge variant={deployStatusVariant(d.status)}>{d.status}</Badge>
                        </TableCell>
                        <TableCell>{d.platform}</TableCell>
                        <TableCell className="text-sm">
                          {d.buildTime ? `${(d.buildTime / 1000).toFixed(1)}s` : '-'}
                        </TableCell>
                        <TableCell>
                          {d.deployUrl ? (
                            <a href={d.deployUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline text-sm">
                              {d.deployUrl}
                            </a>
                          ) : '-'}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(d.createdAt).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setSelectedDeployment(d)}
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No deployments yet
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="health" className="mt-4">
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-muted-foreground">
              {project.healthChecks?.length
                ? `${project.healthChecks.length} health check(s) recorded`
                : 'No health checks yet'}
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => pingMutation.mutate()}
              disabled={pingMutation.isPending || !project.deployUrl}
            >
              <Activity className="mr-2 h-4 w-4" />
              {pingMutation.isPending ? 'Pinging...' : 'Ping Now'}
            </Button>
          </div>
          {project.healthChecks?.length ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {project.healthChecks.slice(0, 10).map((h: any) => (
                <Card key={h.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium">Health Check</CardTitle>
                      <Badge variant={healthStatusVariant(h.status)}>{h.status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-1 text-sm">
                    {h.responseTimeMs != null && (
                      <p>Response time: <span className="font-medium">{h.responseTimeMs}ms</span></p>
                    )}
                    {h.sslExpiry && (
                      <p>SSL expiry: <span className="font-medium">{new Date(h.sslExpiry).toLocaleDateString()}</span></p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Checked: {new Date(h.checkedAt).toLocaleString()}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                {project.deployUrl
                  ? 'Click "Ping Now" to run the first health check'
                  : 'Deploy the project first to enable health checks'}
              </CardContent>
            </Card>
          )}
        </TabsContent>
        <TabsContent value="plugins" className="mt-4">
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Enable or disable plugins for this project.</p>
            {(allPlugins ?? []).length === 0 ? (
              <p className="text-muted-foreground text-sm">No plugins available.</p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {(allPlugins ?? []).map((plugin) => {
                  const pp = projectPluginMap.get(plugin.id);
                  const isEnabled = pp?.enabled ?? false;
                  return (
                    <Card key={plugin.id} className={isEnabled ? 'border-primary/50' : ''}>
                      <CardHeader className="pb-2 flex flex-row items-start gap-3">
                        <span className="text-xl mt-0.5">{plugin.icon ?? '🔌'}</span>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-sm">{plugin.name}</CardTitle>
                          <Badge variant="secondary" className="text-xs capitalize mt-0.5">{plugin.category}</Badge>
                        </div>
                        <Switch
                          checked={isEnabled}
                          onCheckedChange={(v) => togglePlugin(plugin.id, v)}
                          disabled={updatePluginsMutation.isPending}
                        />
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-xs text-muted-foreground">{plugin.description}</p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <PreviewLinkDialog
        projectId={showShareDialog ? project.id : null}
        open={showShareDialog}
        onOpenChange={setShowShareDialog}
      />

      <DeployDialog
        projectId={showDeployDialog ? project.id : null}
        projectName={project.name}
        deployTarget={project.deployTarget}
        open={showDeployDialog}
        onOpenChange={setShowDeployDialog}
      />

      <DeploymentLogsDialog
        deployment={selectedDeployment}
        open={!!selectedDeployment}
        onOpenChange={(open) => { if (!open) setSelectedDeployment(null); }}
      />
    </div>
  );
}
