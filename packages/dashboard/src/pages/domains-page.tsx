import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Globe2,
  Plus,
  RefreshCw,
  Pencil,
  Trash2,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { api } from '@/lib/axios';
import type { DomainRecord } from '@lpf/shared';
import { DomainStatus } from '@lpf/shared';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function relativeTime(iso: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  const now = new Date();
  const diffMs = d.getTime() - now.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'today';
  if (diffDays > 0) return `in ${diffDays} day${diffDays !== 1 ? 's' : ''}`;
  return `${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? 's' : ''} ago`;
}

function expiresClass(record: DomainRecord): string {
  if (record.status === DomainStatus.EXPIRED) return 'text-red-600 font-medium';
  if (record.status === DomainStatus.EXPIRING_SOON) return 'text-amber-600 font-medium';
  return 'text-muted-foreground';
}

function StatusBadge({ status }: { status: DomainStatus }) {
  if (status === DomainStatus.ACTIVE) {
    return (
      <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 gap-1">
        <CheckCircle className="h-3 w-3" /> Active
      </Badge>
    );
  }
  if (status === DomainStatus.EXPIRING_SOON) {
    return (
      <Badge className="bg-amber-100 text-amber-700 border-amber-200 gap-1">
        <AlertTriangle className="h-3 w-3" /> Expiring Soon
      </Badge>
    );
  }
  if (status === DomainStatus.EXPIRED) {
    return (
      <Badge className="bg-red-100 text-red-700 border-red-200 gap-1">
        <XCircle className="h-3 w-3" /> Expired
      </Badge>
    );
  }
  return <Badge variant="outline">{status}</Badge>;
}

// ─── Domain Form ──────────────────────────────────────────────────────────────

interface DomainFormData {
  domain: string;
  clientId: string;
  projectId: string;
  registrar: string;
  purchasedAt: string;
  expiresAt: string;
  autoRenew: boolean;
  purchaseCost: string;
  renewCost: string;
  billedAmount: string;
  notes: string;
  fetchWhois: boolean;
}

const emptyForm: DomainFormData = {
  domain: '',
  clientId: '',
  projectId: '',
  registrar: '',
  purchasedAt: '',
  expiresAt: '',
  autoRenew: false,
  purchaseCost: '',
  renewCost: '',
  billedAmount: '',
  notes: '',
  fetchWhois: true,
};

function formToPayload(form: DomainFormData) {
  return {
    domain: form.domain.trim(),
    clientId: form.clientId,
    ...(form.projectId ? { projectId: form.projectId } : {}),
    ...(form.registrar ? { registrar: form.registrar } : {}),
    ...(form.purchasedAt ? { purchasedAt: new Date(form.purchasedAt).toISOString() } : {}),
    ...(form.expiresAt ? { expiresAt: new Date(form.expiresAt).toISOString() } : {}),
    autoRenew: form.autoRenew,
    ...(form.purchaseCost ? { purchaseCost: parseFloat(form.purchaseCost) } : {}),
    ...(form.renewCost ? { renewCost: parseFloat(form.renewCost) } : {}),
    ...(form.billedAmount ? { billedAmount: parseFloat(form.billedAmount) } : {}),
    ...(form.notes ? { notes: form.notes } : {}),
    fetchWhois: form.fetchWhois,
  };
}

// ─── Domain Dialog ────────────────────────────────────────────────────────────

function DomainDialog({
  open,
  onClose,
  editing,
  clients,
  projects,
}: {
  open: boolean;
  onClose: () => void;
  editing: DomainRecord | null;
  clients: Array<{ id: string; name: string }>;
  projects: Array<{ id: string; name: string }>;
}) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<DomainFormData>(emptyForm);

  // Populate form when editing
  useState(() => {
    if (editing) {
      setForm({
        domain: editing.domain,
        clientId: editing.clientId,
        projectId: editing.projectId ?? '',
        registrar: editing.registrar ?? '',
        purchasedAt: editing.purchasedAt ? editing.purchasedAt.slice(0, 10) : '',
        expiresAt: editing.expiresAt ? editing.expiresAt.slice(0, 10) : '',
        autoRenew: editing.autoRenew,
        purchaseCost: editing.purchaseCost != null ? String(editing.purchaseCost) : '',
        renewCost: editing.renewCost != null ? String(editing.renewCost) : '',
        billedAmount: editing.billedAmount != null ? String(editing.billedAmount) : '',
        notes: editing.notes ?? '',
        fetchWhois: false,
      });
    } else {
      setForm(emptyForm);
    }
  });

  const saveMutation = useMutation({
    mutationFn: (payload: ReturnType<typeof formToPayload>) =>
      editing
        ? api.patch(`/domain-records/${editing.id}`, payload)
        : api.post('/domain-records', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['domain-records'] });
      toast.success(editing ? 'Domain updated' : 'Domain added');
      onClose();
    },
    onError: (err: any) =>
      toast.error(err?.response?.data?.error ?? 'Failed to save domain'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.domain.trim()) return toast.error('Domain is required');
    if (!form.clientId) return toast.error('Client is required');
    saveMutation.mutate(formToPayload(form));
  };

  const set = (field: keyof DomainFormData) => (val: string | boolean) =>
    setForm((f) => ({ ...f, [field]: val }));

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editing ? 'Edit Domain' : 'Add Domain'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>
              Domain <span className="text-destructive">*</span>
            </Label>
            <Input
              value={form.domain}
              onChange={(e) => set('domain')(e.target.value)}
              placeholder="e.g. example.com"
            />
          </div>

          <div className="space-y-2">
            <Label>
              Client <span className="text-destructive">*</span>
            </Label>
            <Select value={form.clientId} onValueChange={set('clientId')}>
              <SelectTrigger>
                <SelectValue placeholder="Select client…" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Project (optional)</Label>
            <Select
              value={form.projectId || '_none'}
              onValueChange={(v) => set('projectId')(v === '_none' ? '' : v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Link to project…" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_none">— None —</SelectItem>
                {projects.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Registrar</Label>
            <Input
              value={form.registrar}
              onChange={(e) => set('registrar')(e.target.value)}
              placeholder="e.g. Namecheap"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Purchased</Label>
              <Input
                type="date"
                value={form.purchasedAt}
                onChange={(e) => set('purchasedAt')(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Expires</Label>
              <Input
                type="date"
                value={form.expiresAt}
                onChange={(e) => set('expiresAt')(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Switch
              id="autoRenew"
              checked={form.autoRenew}
              onCheckedChange={(v) => set('autoRenew')(v)}
            />
            <Label htmlFor="autoRenew">Auto-renew</Label>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label>Cost paid ($)</Label>
              <Input
                type="number"
                step="0.01"
                value={form.purchaseCost}
                onChange={(e) => set('purchaseCost')(e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label>Renew/yr ($)</Label>
              <Input
                type="number"
                step="0.01"
                value={form.renewCost}
                onChange={(e) => set('renewCost')(e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label>Billed ($)</Label>
              <Input
                type="number"
                step="0.01"
                value={form.billedAmount}
                onChange={(e) => set('billedAmount')(e.target.value)}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Notes</Label>
            <Input
              value={form.notes}
              onChange={(e) => set('notes')(e.target.value)}
              placeholder="Optional notes"
            />
          </div>

          {!editing && (
            <div className="flex items-center gap-3 rounded-lg border bg-muted/40 px-3 py-2">
              <Switch
                id="fetchWhois"
                checked={form.fetchWhois}
                onCheckedChange={(v) => set('fetchWhois')(v)}
              />
              <Label htmlFor="fetchWhois" className="text-sm">
                Auto-fetch expiry from WHOIS
              </Label>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? 'Saving…' : editing ? 'Save Changes' : 'Add Domain'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

type StatusFilter = 'ALL' | 'EXPIRING_SOON' | 'EXPIRED';

export function DomainsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<DomainRecord | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data: domainsData, isLoading } = useQuery({
    queryKey: ['domain-records', search, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: '1',
        limit: '100',
        ...(search ? { search } : {}),
        ...(statusFilter !== 'ALL' ? { status: statusFilter } : {}),
      });
      const res = await api.get(`/domain-records?${params}`);
      return res.data as { data: DomainRecord[]; meta: { total: number } };
    },
  });

  const { data: allDomainsData } = useQuery({
    queryKey: ['domain-records-stats'],
    queryFn: async () => {
      const res = await api.get('/domain-records?page=1&limit=1000');
      return res.data as { data: DomainRecord[] };
    },
  });

  const { data: clientsData } = useQuery({
    queryKey: ['clients-for-domains'],
    queryFn: async () => {
      const res = await api.get('/clients?limit=200');
      const raw = res.data.data;
      return Array.isArray(raw) ? raw : (raw?.items ?? []);
    },
  });

  const { data: projectsData } = useQuery({
    queryKey: ['projects-for-domains'],
    queryFn: async () => {
      const res = await api.get('/projects?limit=200');
      const raw = res.data.data;
      return Array.isArray(raw) ? raw : (raw?.items ?? []);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/domain-records/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['domain-records'] });
      queryClient.invalidateQueries({ queryKey: ['domain-records-stats'] });
      toast.success('Domain deleted');
      setDeletingId(null);
    },
    onError: () => toast.error('Failed to delete domain'),
  });

  const refreshMutation = useMutation({
    mutationFn: (id: string) => api.post(`/domain-records/${id}/refresh-whois`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['domain-records'] });
      queryClient.invalidateQueries({ queryKey: ['domain-records-stats'] });
      toast.success('WHOIS refreshed');
    },
    onError: () => toast.error('Failed to refresh WHOIS'),
  });

  const allDomains = allDomainsData?.data ?? [];
  const active = allDomains.filter((d) => d.status === DomainStatus.ACTIVE).length;
  const expiringSoon = allDomains.filter((d) => d.status === DomainStatus.EXPIRING_SOON).length;
  const expired = allDomains.filter((d) => d.status === DomainStatus.EXPIRED).length;

  const domains = domainsData?.data ?? [];
  const clients = clientsData ?? [];
  const projects = projectsData ?? [];

  const openAdd = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const openEdit = (record: DomainRecord) => {
    setEditing(record);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Globe2 className="h-6 w-6" /> Domains
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track domain registrations, expiry dates and costs
          </p>
        </div>
        <Button onClick={openAdd}>
          <Plus className="mr-2 h-4 w-4" /> Add Domain
        </Button>
      </div>

      {/* Stat bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Total</p>
            <p className="text-2xl font-bold mt-1">{allDomains.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-emerald-600 uppercase tracking-wide">Active</p>
            <p className="text-2xl font-bold mt-1 text-emerald-600">{active}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-amber-600 uppercase tracking-wide">Expiring ≤30d</p>
            <p className="text-2xl font-bold mt-1 text-amber-600">{expiringSoon}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-red-600 uppercase tracking-wide">Expired</p>
            <p className="text-2xl font-bold mt-1 text-red-600">{expired}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Input
          className="max-w-xs"
          placeholder="Search domain or client…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="flex gap-2">
          {(['ALL', 'EXPIRING_SOON', 'EXPIRED'] as const).map((s) => (
            <Button
              key={s}
              size="sm"
              variant={statusFilter === s ? 'default' : 'outline'}
              onClick={() => setStatusFilter(s)}
            >
              {s === 'ALL' ? 'All' : s === 'EXPIRING_SOON' ? 'Expiring Soon' : 'Expired'}
            </Button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left">Domain</th>
              <th className="px-4 py-3 text-left">Client</th>
              <th className="px-4 py-3 text-left">Project</th>
              <th className="px-4 py-3 text-left">Registrar</th>
              <th className="px-4 py-3 text-left">Expires</th>
              <th className="px-4 py-3 text-center">Auto-renew</th>
              <th className="px-4 py-3 text-right">Cost</th>
              <th className="px-4 py-3 text-right">Billed</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 10 }).map((__, j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="h-4 rounded bg-muted animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            ) : domains.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-4 py-12 text-center text-muted-foreground">
                  <Globe2 className="h-10 w-10 mx-auto mb-3 opacity-30" />
                  <p className="font-medium">No domains found</p>
                  <p className="text-xs mt-1">Add your first domain to start tracking</p>
                </td>
              </tr>
            ) : (
              domains.map((record) => (
                <tr key={record.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-mono font-medium text-sm">{record.domain}</td>
                  <td className="px-4 py-3">{record.client?.name ?? '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {record.project?.name ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{record.registrar ?? '—'}</td>
                  <td className={`px-4 py-3 ${expiresClass(record)}`}>
                    {record.expiresAt ? (
                      <span title={record.expiresAt.slice(0, 10)}>
                        {relativeTime(record.expiresAt)}
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {record.autoRenew ? (
                      <span className="text-emerald-600">✓</span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right text-muted-foreground">
                    {record.purchaseCost != null ? `$${record.purchaseCost.toFixed(2)}` : '—'}
                  </td>
                  <td className="px-4 py-3 text-right text-muted-foreground">
                    {record.billedAmount != null ? `$${record.billedAmount.toFixed(2)}` : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={record.status} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      {/* Refresh WHOIS */}
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        title="Refresh WHOIS"
                        onClick={() => refreshMutation.mutate(record.id)}
                        disabled={
                          refreshMutation.isPending && refreshMutation.variables === record.id
                        }
                      >
                        <RefreshCw
                          className={`h-3.5 w-3.5 ${
                            refreshMutation.isPending && refreshMutation.variables === record.id
                              ? 'animate-spin'
                              : ''
                          }`}
                        />
                      </Button>
                      {/* Edit */}
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        title="Edit"
                        onClick={() => openEdit(record)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      {/* Delete */}
                      {deletingId === record.id ? (
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-destructive font-medium">Sure?</span>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="h-6 px-2 text-xs"
                            onClick={() => deleteMutation.mutate(record.id)}
                            disabled={deleteMutation.isPending}
                          >
                            Yes
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 px-2 text-xs"
                            onClick={() => setDeletingId(null)}
                          >
                            No
                          </Button>
                        </div>
                      ) : (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 text-muted-foreground hover:text-destructive"
                          title="Delete"
                          onClick={() => setDeletingId(record.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Dialog */}
      <DomainDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditing(null);
        }}
        editing={editing}
        clients={clients.map((c: any) => ({ id: c.id, name: c.name }))}
        projects={projects.map((p: any) => ({ id: p.id, name: p.name }))}
      />
    </div>
  );
}
