import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { ExternalLink, Search, Star, GitFork, Globe, Import } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import api from '@/lib/axios';
import type { MarketplaceTemplate } from '@lpf/shared';

const CATEGORY_LABELS: Record<string, string> = {
  'landing-page': 'Landing Page',
  'e-commerce': 'E-Commerce',
  'e-learning': 'E-Learning',
  'e-card': 'E-Card',
};

const CATEGORIES = ['all', 'landing-page', 'e-commerce', 'e-learning', 'e-card'];

export function MarketplacePage() {
  const navigate = useNavigate();
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [githubQuery, setGithubQuery] = useState('');
  const [githubSearchTerm, setGithubSearchTerm] = useState('');
  const [importUrl, setImportUrl] = useState('');

  // Curated templates
  const { data: curated, isLoading: curatedLoading } = useQuery<MarketplaceTemplate[]>({
    queryKey: ['marketplace-curated', categoryFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (categoryFilter !== 'all') params.set('category', categoryFilter);
      const res = await api.get(`/marketplace/curated?${params}`);
      return res.data.data;
    },
  });

  // GitHub search
  const { data: githubResults, isLoading: githubLoading } = useQuery({
    queryKey: ['marketplace-github', githubSearchTerm],
    queryFn: async () => {
      if (!githubSearchTerm) return [];
      const res = await api.get(`/marketplace/github-search?q=${encodeURIComponent(githubSearchTerm)}`);
      return res.data.data as Array<{
        id: string; name: string; description: string; stars: number; url: string;
        githubRepo: string; previewUrl: string | null;
      }>;
    },
    enabled: !!githubSearchTerm,
  });

  const cloneMutation = useMutation({
    mutationFn: (id: string) => api.post(`/marketplace/clone/${id}`),
    onSuccess: (res) => {
      toast.success('Template cloned — redirecting to template...');
      navigate(`/templates`);
    },
    onError: () => toast.error('Failed to clone template'),
  });

  const importMutation = useMutation({
    mutationFn: (url: string) => api.post('/marketplace/import-url', { url }),
    onSuccess: () => {
      toast.success('Template imported — check Templates page');
      setImportUrl('');
      navigate('/templates');
    },
    onError: () => toast.error('Failed to import URL'),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Template Marketplace</h1>
        <p className="text-muted-foreground">Browse curated templates, search GitHub, or import from any URL</p>
      </div>

      <Tabs defaultValue="curated">
        <TabsList>
          <TabsTrigger value="curated">Curated</TabsTrigger>
          <TabsTrigger value="github">GitHub Search</TabsTrigger>
          <TabsTrigger value="import">Import URL</TabsTrigger>
        </TabsList>

        {/* ── Curated Tab ── */}
        <TabsContent value="curated" className="mt-4 space-y-4">
          {/* Category chips */}
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1 rounded-full text-sm font-medium border transition-colors ${
                  categoryFilter === cat
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'border-border text-muted-foreground hover:border-foreground hover:text-foreground'
                }`}
              >
                {cat === 'all' ? 'All' : CATEGORY_LABELS[cat] ?? cat}
              </button>
            ))}
          </div>

          {curatedLoading ? (
            <div className="text-center py-12 text-muted-foreground">Loading...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(curated ?? []).map((tpl) => (
                <Card key={tpl.id} className="flex flex-col">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-sm leading-tight">{tpl.name}</CardTitle>
                      <Badge variant="outline" className="text-xs shrink-0">
                        {CATEGORY_LABELS[tpl.category] ?? tpl.category}
                      </Badge>
                    </div>
                    {tpl.stars != null && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Star className="h-3 w-3" />
                        {tpl.stars.toLocaleString()}
                      </div>
                    )}
                  </CardHeader>
                  <CardContent className="flex-1">
                    <CardDescription className="text-xs">{tpl.description}</CardDescription>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {tpl.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="flex gap-2 pt-3">
                    {tpl.previewUrl && (
                      <Button variant="outline" size="sm" className="flex-1" asChild>
                        <a href={tpl.previewUrl} target="_blank" rel="noreferrer">
                          <ExternalLink className="h-3.5 w-3.5 mr-1" /> Preview
                        </a>
                      </Button>
                    )}
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => cloneMutation.mutate(tpl.id)}
                      disabled={cloneMutation.isPending}
                    >
                      <GitFork className="h-3.5 w-3.5 mr-1" /> Clone
                    </Button>
                  </CardFooter>
                </Card>
              ))}
              {(curated ?? []).length === 0 && (
                <p className="col-span-full text-center py-12 text-muted-foreground">No templates found</p>
              )}
            </div>
          )}
        </TabsContent>

        {/* ── GitHub Search Tab ── */}
        <TabsContent value="github" className="mt-4 space-y-4">
          <div className="flex gap-2 max-w-lg">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search templates on GitHub..."
                className="pl-9"
                value={githubQuery}
                onChange={(e) => setGithubQuery(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') setGithubSearchTerm(githubQuery); }}
              />
            </div>
            <Button onClick={() => setGithubSearchTerm(githubQuery)} disabled={!githubQuery}>
              Search
            </Button>
          </div>

          {githubLoading ? (
            <div className="text-center py-12 text-muted-foreground">Searching GitHub...</div>
          ) : githubSearchTerm && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(githubResults ?? []).map((repo) => (
                <Card key={repo.id} className="flex flex-col">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">{repo.name}</CardTitle>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Star className="h-3 w-3" />
                      {repo.stars.toLocaleString()}
                      <span className="mx-1">·</span>
                      <span className="font-mono">{repo.githubRepo}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <CardDescription className="text-xs">{repo.description || 'No description'}</CardDescription>
                  </CardContent>
                  <CardFooter className="flex gap-2 pt-3">
                    <Button variant="outline" size="sm" className="flex-1" asChild>
                      <a href={repo.url} target="_blank" rel="noreferrer">
                        <ExternalLink className="h-3.5 w-3.5 mr-1" /> GitHub
                      </a>
                    </Button>
                    {repo.previewUrl && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={repo.previewUrl} target="_blank" rel="noreferrer">
                          <Globe className="h-3.5 w-3.5" />
                        </a>
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ))}
              {(githubResults ?? []).length === 0 && (
                <p className="col-span-full text-center py-12 text-muted-foreground">No results found</p>
              )}
            </div>
          )}
        </TabsContent>

        {/* ── Import URL Tab ── */}
        <TabsContent value="import" className="mt-4">
          <Card className="max-w-lg">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Import className="h-5 w-5" /> Import from URL
              </CardTitle>
              <CardDescription>
                Paste any public HTML page URL. We'll fetch its title and create a template draft for you to customize.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input
                placeholder="https://example.com/landing-page"
                value={importUrl}
                onChange={(e) => setImportUrl(e.target.value)}
              />
              <Button
                onClick={() => importMutation.mutate(importUrl)}
                disabled={!importUrl || importMutation.isPending}
                className="w-full"
              >
                {importMutation.isPending ? 'Importing...' : 'Fetch & Import'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
