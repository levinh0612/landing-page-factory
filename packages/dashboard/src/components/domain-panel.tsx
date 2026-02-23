import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  RefreshCw, Search, Link2, ShieldCheck, ShieldAlert,
  Trash2, CheckCircle2, XCircle, AlertCircle, Info, Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { api } from '@/lib/axios';

interface DomainPanelProps {
  projectId: string;
  deployUrl: string | null;
}

const SUGGEST_TLDS = ['.com', '.net', '.io', '.app', '.dev', '.co', '.vn', '.org', '.site', '.online'];

function stripProtocol(value: string) {
  return value.trim().replace(/^https?:\/\//i, '').replace(/[/?#].*$/, '');
}

function isApexDomain(domain: string): boolean {
  const clean = stripProtocol(domain);
  return clean.split('.').length === 2;
}

/** Extract base name without TLD, e.g. "levinh-ecard.cf" → "levinh-ecard" */
function baseName(domain: string): string {
  const clean = stripProtocol(domain);
  const parts = clean.split('.');
  // If no TLD (single word) or starts with dot, return as-is
  if (parts.length <= 1) return clean;
  return parts.slice(0, -1).join('.');
}

function DnsInstructions({ domain }: { domain: string }) {
  if (!domain.trim()) return null;
  const apex = isApexDomain(domain);
  return (
    <div className="mt-2 rounded-lg border bg-muted/40 px-3 py-2.5 text-xs space-y-1.5">
      <p className="font-semibold flex items-center gap-1">
        <Info className="h-3.5 w-3.5 text-blue-500" />
        DNS Setup — {apex ? 'Root/Apex Domain' : 'Subdomain'}
      </p>
      {apex ? (
        <>
          <p className="text-muted-foreground">
            Root domains cannot use CNAME. Add an <strong>A record</strong> at your registrar:
          </p>
          <div className="font-mono bg-background rounded px-2 py-1 border text-xs">
            Type: A &nbsp; Name: @ &nbsp; Value: <strong>76.76.21.21</strong>
          </div>
        </>
      ) : (
        <>
          <p className="text-muted-foreground">
            Add a <strong>CNAME record</strong> at your registrar:
          </p>
          <div className="font-mono bg-background rounded px-2 py-1 border text-xs">
            Type: CNAME &nbsp; Name: {domain.split('.')[0]} &nbsp; Value: <strong>cname.vercel-dns.com</strong>
          </div>
        </>
      )}
      <p className="text-muted-foreground">
        Domain must be <strong>registered</strong> first. DNS propagation can take up to 48h.
      </p>
    </div>
  );
}

type SuggestResult = { domain: string; available: boolean | null; loading: boolean };

export function DomainPanel({ projectId, deployUrl }: DomainPanelProps) {
  const queryClient = useQueryClient();
  const [newDomain, setNewDomain] = useState('');
  const [addedDomain, setAddedDomain] = useState('');
  const [searchDomain, setSearchDomain] = useState('');
  const [searchResult, setSearchResult] = useState<{ available: boolean; purchasable: boolean } | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<SuggestResult[]>([]);
  const [suggesting, setSuggesting] = useState(false);

  const { data: domains, isLoading: domainsLoading, refetch } = useQuery<
    Array<{ name: string; verified: boolean; createdAt: number }>
  >({
    queryKey: ['vercel-domains', projectId],
    queryFn: async () => {
      const res = await api.get(`/projects/${projectId}/vercel-domains`);
      return res.data.data ?? [];
    },
    enabled: !!deployUrl,
    retry: false,
  });

  const addDomainMutation = useMutation({
    mutationFn: (domain: string) => api.post(`/projects/${projectId}/vercel-domains`, { domain }),
    onSuccess: (_res, domain) => {
      queryClient.invalidateQueries({ queryKey: ['vercel-domains', projectId] });
      setAddedDomain(domain);
      setNewDomain('');
      toast.success('Domain linked to Vercel — now set up DNS records below');
    },
    onError: (err: any) => toast.error(err?.response?.data?.error || 'Failed to add domain'),
  });

  const removeDomainMutation = useMutation({
    mutationFn: (domain: string) =>
      api.delete(`/projects/${projectId}/vercel-domains/${encodeURIComponent(domain)}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vercel-domains', projectId] });
      toast.success('Domain removed');
    },
    onError: () => toast.error('Failed to remove domain'),
  });

  const handleSearch = async () => {
    const clean = stripProtocol(searchDomain);
    if (!clean) return;
    setSearching(true);
    setSearchResult(null);
    setSearchError(null);
    setSuggestions([]);
    try {
      const res = await api.get(
        `/projects/${projectId}/domain-availability?name=${encodeURIComponent(clean)}`,
      );
      setSearchResult(res.data.data);
    } catch (err: any) {
      const raw = err?.response?.data?.error || '';
      // Show friendly message instead of raw Vercel JSON
      setSearchError(raw.includes('Invalid domain') || raw.includes('issues')
        ? 'Invalid domain format. Enter just the domain name, e.g. mycard.com'
        : 'Availability check not supported for this TLD');
    } finally {
      setSearching(false);
    }
  };

  const handleSuggest = async () => {
    const base = baseName(searchDomain) || stripProtocol(searchDomain);
    if (!base) return;
    setSuggesting(true);
    setSuggestions(SUGGEST_TLDS.map((tld) => ({ domain: base + tld, available: null, loading: true })));
    setSearchResult(null);
    setSearchError(null);

    await Promise.all(
      SUGGEST_TLDS.map(async (tld, i) => {
        const domain = base + tld;
        try {
          const res = await api.get(
            `/projects/${projectId}/domain-availability?name=${encodeURIComponent(domain)}`,
          );
          setSuggestions((prev) =>
            prev.map((s, idx) => idx === i ? { ...s, available: res.data.data.available, loading: false } : s),
          );
        } catch {
          setSuggestions((prev) =>
            prev.map((s, idx) => idx === i ? { ...s, available: null, loading: false } : s),
          );
        }
      }),
    );
    setSuggesting(false);
  };

  return (
    <div className="space-y-4 p-1">
      {/* ── Linked Domains ── */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Linked Domains
          </p>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => refetch()}>
            <RefreshCw className="h-3 w-3" />
          </Button>
        </div>

        {!deployUrl ? (
          <p className="text-xs text-muted-foreground italic">Deploy first to manage domains.</p>
        ) : domainsLoading ? (
          <div className="space-y-1.5">
            {[1, 2].map((i) => <div key={i} className="h-8 bg-muted rounded animate-pulse" />)}
          </div>
        ) : domains && domains.length > 0 ? (
          <div className="space-y-1.5">
            {domains.map((d) => (
              <div
                key={d.name}
                className="flex items-center gap-2 bg-background rounded-lg px-3 py-2 border group"
              >
                {d.verified
                  ? <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
                  : <ShieldAlert className="h-4 w-4 text-amber-500 shrink-0" />}
                <a
                  href={`https://${d.name}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 text-sm font-medium hover:underline truncate"
                >
                  {d.name}
                </a>
                <Badge variant={d.verified ? 'default' : 'outline'} className="text-xs shrink-0">
                  {d.verified ? 'DNS Active' : 'Pending DNS'}
                </Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 text-destructive shrink-0"
                  onClick={() => removeDomainMutation.mutate(d.name)}
                  disabled={removeDomainMutation.isPending}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground italic">No custom domains yet.</p>
        )}
      </div>

      <Separator />

      {/* ── Check Domain Availability + Suggest ── */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
          Check Domain Availability
        </p>
        <div className="flex gap-2">
          <Input
            value={searchDomain}
            onChange={(e) => {
              setSearchDomain(e.target.value);
              setSearchResult(null);
              setSearchError(null);
              setSuggestions([]);
            }}
            placeholder="e.g. levinh-ecard or levinh-ecard.com"
            className="h-8 text-sm"
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button
            size="sm"
            variant="outline"
            className="h-8 shrink-0"
            onClick={handleSearch}
            disabled={searching || !searchDomain.trim()}
            title="Check specific domain"
          >
            {searching ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Search className="h-3.5 w-3.5" />}
          </Button>
          <Button
            size="sm"
            className="h-8 shrink-0 gap-1"
            onClick={handleSuggest}
            disabled={suggesting || !searchDomain.trim()}
            title="Suggest available domains across TLDs"
          >
            {suggesting
              ? <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              : <Sparkles className="h-3.5 w-3.5" />}
            Suggest
          </Button>
        </div>

        {searchError && (
          <div className="mt-2 flex items-center gap-2 rounded-lg px-3 py-2 text-sm border bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-950/20 dark:border-amber-800 dark:text-amber-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{searchError}</span>
          </div>
        )}

        {searchResult && (
          <div className={`mt-2 flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium border ${
            searchResult.available
              ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/20 dark:border-emerald-800 dark:text-emerald-400'
              : 'bg-red-50 border-red-200 text-red-700 dark:bg-red-950/20 dark:border-red-800 dark:text-red-400'
          }`}>
            {searchResult.available
              ? <CheckCircle2 className="h-4 w-4 shrink-0" />
              : <XCircle className="h-4 w-4 shrink-0" />}
            <span className="flex-1">
              <strong>{stripProtocol(searchDomain)}</strong> is{' '}
              {searchResult.available ? 'available!' : 'already registered'}
              {searchResult.available && searchResult.purchasable && ' — purchasable via Vercel'}
            </span>
            {searchResult.available && (
              <Button
                size="sm"
                variant="outline"
                className="h-6 text-xs border-emerald-300 text-emerald-700 hover:bg-emerald-100"
                onClick={() => { setNewDomain(stripProtocol(searchDomain)); setSearchResult(null); }}
              >
                Use this →
              </Button>
            )}
          </div>
        )}

        {/* Suggestion results grid */}
        {suggestions.length > 0 && (
          <div className="mt-2 grid grid-cols-2 gap-1.5">
            {suggestions.map((s) => (
              <div
                key={s.domain}
                className={`flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-xs ${
                  s.loading
                    ? 'bg-muted animate-pulse'
                    : s.available === true
                    ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-800'
                    : s.available === false
                    ? 'bg-muted/40 opacity-60'
                    : 'bg-muted/40'
                }`}
              >
                {s.loading ? (
                  <RefreshCw className="h-3 w-3 animate-spin text-muted-foreground shrink-0" />
                ) : s.available === true ? (
                  <CheckCircle2 className="h-3 w-3 text-emerald-600 shrink-0" />
                ) : s.available === false ? (
                  <XCircle className="h-3 w-3 text-muted-foreground shrink-0" />
                ) : (
                  <AlertCircle className="h-3 w-3 text-amber-500 shrink-0" />
                )}
                <span className={`flex-1 truncate font-medium ${s.available === true ? 'text-emerald-700 dark:text-emerald-400' : 'text-muted-foreground'}`}>
                  {s.domain}
                </span>
                {s.available === true && (
                  <button
                    className="text-emerald-600 hover:text-emerald-800 font-semibold shrink-0"
                    onClick={() => setNewDomain(s.domain)}
                    title="Use this domain"
                  >
                    Use →
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <Separator />

      {/* ── Add Custom Domain ── */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
          Add Custom Domain
        </p>
        <div className="flex gap-2">
          <Input
            value={newDomain}
            onChange={(e) => { setNewDomain(stripProtocol(e.target.value)); setAddedDomain(''); }}
            placeholder="e.g. mycard.com or sub.mysite.com"
            className="h-8 text-sm"
            onKeyDown={(e) => e.key === 'Enter' && newDomain && addDomainMutation.mutate(newDomain)}
          />
          <Button
            size="sm"
            className="h-8 shrink-0"
            onClick={() => newDomain && addDomainMutation.mutate(newDomain)}
            disabled={addDomainMutation.isPending || !newDomain.trim() || !deployUrl}
          >
            {addDomainMutation.isPending
              ? <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              : <Link2 className="h-3.5 w-3.5" />}
          </Button>
        </div>
        {!deployUrl && (
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" /> Deploy the project first before adding a domain.
          </p>
        )}

        <DnsInstructions domain={addedDomain || newDomain} />
      </div>
    </div>
  );
}
