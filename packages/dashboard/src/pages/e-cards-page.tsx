import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  CreditCard, Plus, ArrowLeft, Rocket, ExternalLink, RefreshCw, ChevronRight,
  Trash2, Globe, ChevronDown, ChevronUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ConfigEditor } from '@/components/config-editor';
import { DomainPanel } from '@/components/domain-panel';
import { api } from '@/lib/axios';
import type { TemplateConfigSchema } from '@lpf/shared';

// ─── Types ────────────────────────────────────────────────────────────────────
type WizardState =
  | { mode: 'list' }
  | { mode: 'step1' }
  | { mode: 'step2'; templateId: string }
  | { mode: 'step3'; templateId: string; projectId: string }
  | { mode: 'step4'; projectId: string; deployUrl?: string };

interface ECardTemplate {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  version: number;
  configSchema: TemplateConfigSchema | null;
}

interface ECardProject {
  id: string;
  name: string;
  slug: string;
  status: string;
  deployUrl: string | null;
  createdAt: string;
  template: { name: string; slug: string } | null;
  client: { name: string } | null;
}

// ─── Style Card visuals ────────────────────────────────────────────────────────
const STYLE_META: Record<string, { preview: React.ReactNode; color: string; tag: string }> = {
  'ecard-classic': {
    color: '#1e3a5f',
    tag: 'Professional',
    preview: (
      <div style={{ background: '#fff', borderRadius: 8, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.1)', height: 110 }}>
        <div style={{ width: 6, position: 'absolute', top: 0, bottom: 0, left: 0, background: '#1e3a5f' }} />
        <div style={{ padding: '12px 12px 12px 16px' }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#1e3a5f', marginBottom: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12, fontWeight: 700 }}>JS</div>
          <div style={{ height: 8, background: '#1e3a5f', borderRadius: 2, width: 80, marginBottom: 4 }} />
          <div style={{ height: 5, background: '#e2e8f0', borderRadius: 2, width: 60 }} />
        </div>
      </div>
    ),
  },
  'ecard-anime': {
    color: '#FF6B9D',
    tag: 'Creative',
    preview: (
      <div style={{ background: 'linear-gradient(135deg,#fce4ec,#e8d5f5)', borderRadius: 12, height: 110, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg,#FF6B9D,#7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 13, fontWeight: 700 }}>✨</div>
        <div style={{ height: 7, background: 'linear-gradient(90deg,#FF6B9D,#7C3AED)', borderRadius: 4, width: 70 }} />
        <div style={{ height: 5, background: 'rgba(124,58,237,0.2)', borderRadius: 4, width: 50 }} />
      </div>
    ),
  },
  'ecard-modern': {
    color: '#0ea5e9',
    tag: 'Minimal',
    preview: (
      <div style={{ background: '#fff', borderRadius: 12, height: 110, display: 'flex', gap: 10, padding: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
        <div style={{ width: 42, height: 42, borderRadius: 10, background: '#0ea5e9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>AC</div>
        <div style={{ flex: 1 }}>
          <div style={{ height: 8, background: '#111', borderRadius: 2, width: 60, marginBottom: 4 }} />
          <div style={{ height: 5, background: '#e2e8f0', borderRadius: 2, width: 80, marginBottom: 8 }} />
          <div style={{ height: 4, background: '#f0f0f0', borderRadius: 2, width: '90%' }} />
        </div>
      </div>
    ),
  },
};

// ─── Main Page ─────────────────────────────────────────────────────────────────
export function ECardsPage() {
  const [state, setState] = useState<WizardState>({ mode: 'list' });

  if (state.mode === 'list') {
    return <ECardListView onNew={() => setState({ mode: 'step1' })} />;
  }
  if (state.mode === 'step1') {
    return (
      <ECardWizardShell step={1} onBack={() => setState({ mode: 'list' })}>
        <Step1ChooseStyle
          onSelect={(templateId) => setState({ mode: 'step2', templateId })}
        />
      </ECardWizardShell>
    );
  }
  if (state.mode === 'step2') {
    return (
      <ECardWizardShell step={2} onBack={() => setState({ mode: 'step1' })}>
        <Step2BasicInfo
          templateId={state.templateId}
          onCreated={(projectId) => setState({ mode: 'step3', templateId: state.templateId, projectId })}
        />
      </ECardWizardShell>
    );
  }
  if (state.mode === 'step3') {
    return (
      <ECardWizardShell step={3} onBack={() => setState({ mode: 'step2', templateId: state.templateId })}>
        <Step3Customize
          templateId={state.templateId}
          projectId={state.projectId}
          onNext={(deployUrl) => setState({ mode: 'step4', projectId: state.projectId, deployUrl })}
        />
      </ECardWizardShell>
    );
  }
  // step4
  return (
    <ECardWizardShell step={4} onBack={() => setState({ mode: 'list' })}>
      <Step4Deploy
        projectId={state.projectId}
        initialDeployUrl={state.deployUrl}
        onDone={() => setState({ mode: 'list' })}
      />
    </ECardWizardShell>
  );
}

// ─── List View ─────────────────────────────────────────────────────────────────
function ECardListView({ onNew }: { onNew: () => void }) {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['ecard-projects'],
    queryFn: async () => {
      const res = await api.get('/projects?limit=100');
      const raw = res.data.data;
      const projects: ECardProject[] = Array.isArray(raw) ? raw : (raw?.items ?? []);
      return projects.filter((p) => p.template?.category === 'e-card');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/projects/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ecard-projects'] });
      toast.success('E-Card deleted');
    },
    onError: () => toast.error('Failed to delete'),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <CreditCard className="h-6 w-6" /> E-Cards
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Digital business cards — deploy in minutes</p>
        </div>
        <Button onClick={onNew}>
          <Plus className="mr-2 h-4 w-4" /> New E-Card
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => <div key={i} className="h-48 rounded-xl border bg-muted animate-pulse" />)}
        </div>
      ) : data && data.length > 0 ? (
        <div className="space-y-4">
          {data.map((project) => (
            <ECardCard
              key={project.id}
              project={project}
              onDelete={(id) => deleteMutation.mutate(id)}
              deleting={deleteMutation.isPending && deleteMutation.variables === project.id}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-16 text-center">
            <CreditCard className="h-12 w-12 mx-auto mb-4 text-muted-foreground/40" />
            <p className="text-lg font-medium mb-1">No E-Cards yet</p>
            <p className="text-sm text-muted-foreground mb-6">Create your first digital business card in 4 steps</p>
            <Button onClick={onNew}>
              <Plus className="mr-2 h-4 w-4" /> Create E-Card
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ─── E-Card Card (full panel) ──────────────────────────────────────────────────
function ECardCard({
  project,
  onDelete,
  deleting,
}: {
  project: ECardProject;
  onDelete: (id: string) => void;
  deleting: boolean;
}) {
  const queryClient = useQueryClient();
  const [domainsOpen, setDomainsOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const redeployMutation = useMutation({
    mutationFn: () => api.post(`/projects/${project.id}/deploy`),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['ecard-projects'] });
      toast.success(`Redeployed → ${res.data.data?.deployUrl || 'done'}`);
    },
    onError: (err: any) => toast.error(err?.response?.data?.error || 'Deploy failed'),
  });

  const statusColor =
    project.status === 'DEPLOYED' ? 'bg-emerald-500' :
    project.status === 'IN_PROGRESS' ? 'bg-amber-500' : 'bg-slate-400';

  return (
    <Card className="overflow-hidden border">
      {/* ── Header row ── */}
      <div className="flex items-center gap-4 p-4">
        {/* Status dot */}
        <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${statusColor}`} />

        {/* Name + meta */}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate">{project.name}</p>
          <p className="text-xs text-muted-foreground">
            {project.template?.name ?? '—'} · {project.client?.name ?? 'No client'}
          </p>
        </div>

        {/* Deploy URL chip */}
        {project.deployUrl && (
          <a
            href={project.deployUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1 text-xs text-primary hover:underline max-w-[220px] truncate"
          >
            <Globe className="h-3 w-3 shrink-0" />
            <span className="truncate">{project.deployUrl.replace('https://', '')}</span>
            <ExternalLink className="h-3 w-3 shrink-0" />
          </a>
        )}

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Redeploy */}
          <Button
            size="sm"
            variant="outline"
            className="h-8 gap-1.5 text-xs"
            onClick={() => redeployMutation.mutate()}
            disabled={redeployMutation.isPending}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${redeployMutation.isPending ? 'animate-spin' : ''}`} />
            {redeployMutation.isPending ? 'Deploying…' : 'Redeploy'}
          </Button>

          {/* Domains toggle */}
          <Button
            size="sm"
            variant={domainsOpen ? 'secondary' : 'ghost'}
            className="h-8 gap-1.5 text-xs"
            onClick={() => setDomainsOpen((v) => !v)}
          >
            <Globe className="h-3.5 w-3.5" />
            Domains
            {domainsOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </Button>

          {/* Delete */}
          {confirmDelete ? (
            <div className="flex items-center gap-1">
              <span className="text-xs text-destructive font-medium">Sure?</span>
              <Button
                size="sm"
                variant="destructive"
                className="h-7 px-2 text-xs"
                onClick={() => { onDelete(project.id); setConfirmDelete(false); }}
                disabled={deleting}
              >
                Yes
              </Button>
              <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={() => setConfirmDelete(false)}>
                No
              </Button>
            </div>
          ) : (
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              onClick={() => setConfirmDelete(true)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>

      {/* ── Domain panel ── */}
      {domainsOpen && (
        <>
          <Separator />
          <div className="p-4 bg-muted/30">
            <DomainPanel projectId={project.id} deployUrl={project.deployUrl} />
          </div>
        </>
      )}
    </Card>
  );
}

// ─── Wizard Shell ──────────────────────────────────────────────────────────────
function ECardWizardShell({
  step,
  onBack,
  children,
}: {
  step: number;
  onBack: () => void;
  children: React.ReactNode;
}) {
  const steps = ['Choose Style', 'Basic Info', 'Customize', 'Deploy'];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-xl font-bold">New E-Card</h1>
          <p className="text-xs text-muted-foreground">Step {step} of 4</p>
        </div>
      </div>

      {/* Step indicators */}
      <div className="flex items-center gap-0">
        {steps.map((label, i) => {
          const idx = i + 1;
          const isActive = idx === step;
          const isDone = idx < step;
          return (
            <div key={label} className="flex items-center">
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                isActive ? 'bg-primary text-primary-foreground' :
                isDone ? 'bg-primary/10 text-primary' :
                'text-muted-foreground'
              }`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                  isActive ? 'bg-white/20' : isDone ? 'bg-primary/20' : 'bg-muted'
                }`}>{idx}</span>
                {label}
              </div>
              {i < steps.length - 1 && (
                <ChevronRight className={`h-4 w-4 mx-1 ${isDone ? 'text-primary' : 'text-muted-foreground/30'}`} />
              )}
            </div>
          );
        })}
      </div>

      {children}
    </div>
  );
}

// ─── Step 1: Choose Style ──────────────────────────────────────────────────────
function Step1ChooseStyle({ onSelect }: { onSelect: (templateId: string) => void }) {
  const { data: templates, isLoading } = useQuery<ECardTemplate[]>({
    queryKey: ['templates-ecard'],
    queryFn: async () => {
      const res = await api.get('/templates?limit=100');
      const raw = res.data.data;
      const all: ECardTemplate[] = Array.isArray(raw) ? raw : (raw?.items ?? []);
      return all.filter((t) => t.category === 'e-card');
    },
  });

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-3">
        {[1, 2, 3].map((i) => <div key={i} className="h-56 rounded-xl border bg-muted animate-pulse" />)}
      </div>
    );
  }

  const cards = templates ?? [];

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Choose a style</h2>
      <div className="grid gap-4 sm:grid-cols-3">
        {cards.map((tpl) => {
          const meta = STYLE_META[tpl.slug];
          return (
            <button
              key={tpl.id}
              onClick={() => onSelect(tpl.id)}
              className="group text-left rounded-xl border-2 border-transparent hover:border-primary bg-card p-4 space-y-3 transition-all hover:shadow-lg focus:outline-none focus:border-primary"
            >
              <div className="relative rounded-lg overflow-hidden">
                {meta?.preview ?? <div className="h-28 bg-muted rounded-lg" />}
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm">{tpl.name}</span>
                  {meta?.tag && (
                    <Badge variant="outline" className="text-xs" style={{ borderColor: meta.color, color: meta.color }}>
                      {meta.tag}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">{tpl.description}</p>
              </div>
            </button>
          );
        })}
        {cards.length === 0 && (
          <div className="col-span-3 py-12 text-center text-muted-foreground">
            No e-card templates found. Run <code className="text-xs bg-muted px-1 rounded">npx prisma db seed</code> first.
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Step 2: Basic Info ────────────────────────────────────────────────────────
function Step2BasicInfo({ templateId, onCreated }: { templateId: string; onCreated: (id: string) => void }) {
  const [fullName, setFullName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [clientId, setClientId] = useState('');
  const [deployTarget, setDeployTarget] = useState<'VERCEL' | 'NETLIFY'>('VERCEL');

  const { data: clientsData } = useQuery({
    queryKey: ['clients-for-ecard'],
    queryFn: async () => {
      const res = await api.get('/clients?limit=100');
      const raw = res.data.data;
      return Array.isArray(raw) ? raw : (raw?.items ?? []);
    },
  });

  const createMutation = useMutation({
    mutationFn: (payload: {
      templateId: string;
      clientId?: string;
      name: string;
      slug: string;
      status: string;
      deployTarget: string;
      config: Record<string, string>;
    }) => api.post('/projects', payload),
    onSuccess: (res) => {
      const id = res.data.data.id as string;
      onCreated(id);
    },
    onError: (err: any) => toast.error(err?.response?.data?.error || 'Failed to create project'),
  });

  const slugify = (name: string) =>
    name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 50);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return toast.error('Full name is required');
    createMutation.mutate({
      templateId,
      ...(clientId ? { clientId } : {}),
      name: fullName + ' — E-Card',
      slug: slugify(fullName) + '-ecard-' + Date.now().toString(36),
      status: 'IN_PROGRESS',
      deployTarget,
      config: { fullName: fullName.trim(), jobTitle: jobTitle.trim(), company: company.trim() },
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Basic Information</CardTitle>
        <CardDescription>Fill in the core details for this e-card project.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name <span className="text-destructive">*</span></Label>
            <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="e.g. Alex Chen" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="jobTitle">Job Title</Label>
            <Input id="jobTitle" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder="e.g. Full-Stack Engineer" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="company">Company</Label>
            <Input id="company" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="e.g. TechVentures Inc." />
          </div>
          <div className="space-y-2">
            <Label>Client (optional)</Label>
            <Select value={clientId} onValueChange={setClientId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a client…" />
              </SelectTrigger>
              <SelectContent>
                {(clientsData ?? []).map((c: any) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Deploy Target</Label>
            <Select value={deployTarget} onValueChange={(v) => setDeployTarget(v as 'VERCEL' | 'NETLIFY')}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="VERCEL">Vercel</SelectItem>
                <SelectItem value="NETLIFY">Netlify</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" disabled={createMutation.isPending} className="w-full">
            {createMutation.isPending ? 'Creating…' : 'Continue →'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

// ─── Step 3: Customize ─────────────────────────────────────────────────────────
function Step3Customize({
  templateId,
  projectId,
  onNext,
}: {
  templateId: string;
  projectId: string;
  onNext: (deployUrl?: string) => void;
}) {
  const queryClient = useQueryClient();
  const [config, setConfig] = useState<Record<string, unknown>>({});
  const [iframeKey, setIframeKey] = useState(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data: tplData } = useQuery({
    queryKey: ['template', templateId],
    queryFn: async () => {
      const res = await api.get(`/templates/${templateId}`);
      return res.data.data;
    },
  });

  const { data: projData } = useQuery({
    queryKey: ['project', projectId],
    queryFn: async () => {
      const res = await api.get(`/projects/${projectId}`);
      return res.data.data;
    },
  });

  useEffect(() => {
    if (projData?.config && typeof projData.config === 'object') {
      setConfig(projData.config as Record<string, unknown>);
    }
  }, [projData?.config]);

  const saveConfig = useMutation({
    mutationFn: (newConfig: Record<string, unknown>) =>
      api.patch(`/projects/${projectId}`, { config: newConfig }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      setIframeKey((k) => k + 1);
    },
    onError: () => toast.error('Failed to save config'),
  });

  const handleConfigChange = (newConfig: Record<string, unknown>) => {
    setConfig(newConfig);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      saveConfig.mutate(newConfig);
    }, 800);
  };

  const configSchema = tplData?.configSchema as TemplateConfigSchema | null;
  const hasFiles = tplData?.version > 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-lg font-semibold">Customize Your Card</h2>
        <Button onClick={() => onNext()} disabled={saveConfig.isPending}>
          {saveConfig.isPending ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : null}
          Continue to Deploy →
        </Button>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="overflow-y-auto max-h-[70vh]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Fields</CardTitle>
          </CardHeader>
          <CardContent>
            {configSchema ? (
              <ConfigEditor configSchema={configSchema} config={config} onChange={handleConfigChange} />
            ) : (
              <p className="text-sm text-muted-foreground">Loading schema…</p>
            )}
          </CardContent>
        </Card>

        <div className="space-y-3">
          <div className="text-sm font-medium text-muted-foreground">Live Preview</div>
          {hasFiles ? (
            <div className="rounded-xl border bg-white overflow-hidden shadow-sm" style={{ height: 520 }}>
              <iframe
                key={iframeKey}
                src={`/api/projects/${projectId}/preview`}
                className="w-full h-full"
                title="E-Card Preview"
              />
            </div>
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground text-sm">
                Template files not found. Run <code className="bg-muted px-1 rounded text-xs">npx prisma db seed</code> to populate.
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Step 4: Deploy ────────────────────────────────────────────────────────────
function Step4Deploy({
  projectId,
  initialDeployUrl,
  onDone,
}: {
  projectId: string;
  initialDeployUrl?: string;
  onDone: () => void;
}) {
  const queryClient = useQueryClient();
  const [deployUrl, setDeployUrl] = useState(initialDeployUrl ?? '');

  const { data: projData } = useQuery({
    queryKey: ['project', projectId],
    queryFn: async () => {
      const res = await api.get(`/projects/${projectId}`);
      return res.data.data;
    },
  });

  const deployMutation = useMutation({
    mutationFn: () => api.post(`/projects/${projectId}/deploy`),
    onSuccess: (res) => {
      const url = res.data.data.deployUrl as string | undefined;
      if (url) setDeployUrl(url);
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      queryClient.invalidateQueries({ queryKey: ['ecard-projects'] });
      toast.success('Deployed successfully!');
    },
    onError: (err: any) => toast.error(err?.response?.data?.error || 'Deployment failed'),
  });

  const effectiveUrl = deployUrl || projData?.deployUrl;

  return (
    <Card className="max-w-lg mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Rocket className="h-5 w-5" /> Deploy E-Card
        </CardTitle>
        <CardDescription>
          Deploy your digital business card to {projData?.deployTarget || 'the cloud'}.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Target:</span>
          <Badge variant="outline">{projData?.deployTarget || '…'}</Badge>
        </div>

        {effectiveUrl ? (
          <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
            <p className="text-sm font-medium text-green-600">Deployed!</p>
            <a
              href={effectiveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline flex items-center gap-1 break-all"
            >
              {effectiveUrl} <ExternalLink className="h-3 w-3 shrink-0" />
            </a>
          </div>
        ) : null}

        <div className="flex flex-col gap-3">
          <Button
            onClick={() => deployMutation.mutate()}
            disabled={deployMutation.isPending}
            className="w-full"
          >
            {deployMutation.isPending ? (
              <><RefreshCw className="mr-2 h-4 w-4 animate-spin" />Deploying…</>
            ) : (
              <><Rocket className="mr-2 h-4 w-4" />{effectiveUrl ? 'Re-Deploy' : 'Deploy Now'}</>
            )}
          </Button>
          <Button variant="outline" onClick={onDone} className="w-full">
            {effectiveUrl ? 'Done — Back to E-Cards' : 'Skip & Back to E-Cards'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
