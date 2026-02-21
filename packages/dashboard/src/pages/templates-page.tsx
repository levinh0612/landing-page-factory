import { useState, useEffect, useMemo, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, MoreHorizontal, Pencil, Trash2, ExternalLink, History, Copy, Download, Upload } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createTemplateSchema } from '@lpf/shared';
import type { CreateTemplateInput } from '@lpf/shared';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { api } from '@/lib/axios';
import { useDebounce } from '@/hooks/use-debounce';
import { usePagination } from '@/hooks/use-pagination';
import { PaginationControls } from '@/components/pagination-controls';
import { EditTemplateDialog } from '@/components/edit-template-dialog';
import { VersionHistoryDialog } from '@/components/version-history-dialog';
import { CloneTemplateDialog } from '@/components/clone-template-dialog';

export function TemplatesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [versionItem, setVersionItem] = useState<any>(null);
  const [cloneItem, setCloneItem] = useState<any>(null);
  const importRef = useRef<HTMLInputElement>(null);

  const debouncedSearch = useDebounce(search);
  const { page, limit, setPage, setLimit, resetPage, meta, setMeta } = usePagination();

  useEffect(() => { resetPage(); }, [debouncedSearch, resetPage]);

  const { data, isLoading } = useQuery({
    queryKey: ['templates', debouncedSearch, page, limit],
    queryFn: async () => {
      const res = await api.get('/templates', { params: { search: debouncedSearch, page, limit } });
      return res.data;
    },
  });

  useEffect(() => {
    if (data?.meta) setMeta({ total: data.meta.total, totalPages: data.meta.totalPages });
  }, [data?.meta, setMeta]);

  // Derive unique categories from fetched data
  const categories = useMemo(() => {
    if (!data?.data) return [];
    const cats = new Set<string>(data.data.map((t: any) => t.category));
    return Array.from(cats).sort();
  }, [data?.data]);

  const filteredTemplates = useMemo(() => {
    if (!data?.data) return [];
    if (!categoryFilter) return data.data;
    return data.data.filter((t: any) => t.category === categoryFilter);
  }, [data?.data, categoryFilter]);

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/templates/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      toast.success('Template deleted');
    },
    onError: () => toast.error('Failed to delete template'),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateTemplateInput) => api.post('/templates', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      setDialogOpen(false);
      toast.success('Template created');
    },
    onError: () => toast.error('Failed to create template'),
  });

  const importMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('template', file);
      const baseName = file.name.replace(/\.zip$/i, '');
      formData.append('name', baseName);
      formData.append('slug', baseName.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
      return api.post('/templates/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      toast.success('Template imported');
    },
    onError: () => toast.error('Failed to import template'),
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateTemplateInput>({
    resolver: zodResolver(createTemplateSchema),
  });

  const onSubmit = (formData: CreateTemplateInput) => {
    createMutation.mutate(formData);
    reset();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleExport = (id: string) => {
    window.open(`/api/templates/${id}/export`, '_blank');
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      importMutation.mutate(file);
      e.target.value = '';
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'default' as const;
      case 'DRAFT': return 'secondary' as const;
      case 'DEPRECATED': return 'destructive' as const;
      default: return 'outline' as const;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Templates</h1>
        <div className="flex gap-2">
          <input
            ref={importRef}
            type="file"
            accept=".zip"
            onChange={handleImport}
            className="hidden"
          />
          <Button variant="outline" onClick={() => importRef.current?.click()}>
            <Upload className="mr-2 h-4 w-4" /> Import
          </Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="mr-2 h-4 w-4" /> New Template</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create Template</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input {...register('name')} />
                  {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Slug</Label>
                  <Input {...register('slug')} placeholder="my-template" />
                  {errors.slug && <p className="text-xs text-destructive">{errors.slug.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Input {...register('category')} placeholder="e.g. education, restaurant" />
                  {errors.category && <p className="text-xs text-destructive">{errors.category.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input {...register('description')} />
                </div>
                <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                  {createMutation.isPending ? 'Creating...' : 'Create'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        {categories.length > 1 && (
          <div className="flex flex-wrap gap-1.5">
            <Button
              variant={categoryFilter === null ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCategoryFilter(null)}
            >
              All
            </Button>
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={categoryFilter === cat ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCategoryFilter(cat === categoryFilter ? null : cat)}
              >
                {cat}
              </Button>
            ))}
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-lg" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredTemplates.map((template: any) => (
              <Card key={template.id} className="overflow-hidden">
                {template.thumbnailUrl && (
                  <div className="h-36 overflow-hidden bg-muted">
                    <img
                      src={template.thumbnailUrl}
                      alt={template.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
                <CardHeader className="flex flex-row items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{template.name}</CardTitle>
                    <CardDescription>{template.category}</CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setEditItem(template)}>
                        <Pencil className="mr-2 h-4 w-4" /> Edit
                      </DropdownMenuItem>
                      {(template.version ?? 0) > 0 && (
                        <DropdownMenuItem asChild>
                          <a
                            href={`/api/templates/${template.id}/preview`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <ExternalLink className="mr-2 h-4 w-4" /> Preview
                          </a>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => setVersionItem(template)}>
                        <History className="mr-2 h-4 w-4" /> Version History
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setCloneItem(template)}>
                        <Copy className="mr-2 h-4 w-4" /> Clone
                      </DropdownMenuItem>
                      {(template.version ?? 0) > 0 && (
                        <DropdownMenuItem onClick={() => handleExport(template.id)}>
                          <Download className="mr-2 h-4 w-4" /> Export
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => handleDelete(template.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {template.description}
                  </p>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {template.techStack?.map((tech: string) => (
                      <Badge key={tech} variant="outline" className="text-xs">{tech}</Badge>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant={statusColor(template.status)}>{template.status}</Badge>
                      {(template.version ?? 0) > 0 && (
                        <Badge variant="outline" className="text-xs font-mono">
                          v{template.version}
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {template._count?.projects ?? 0} projects
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <PaginationControls
            page={page}
            totalPages={meta.totalPages}
            limit={limit}
            onPageChange={setPage}
            onLimitChange={setLimit}
          />
        </>
      )}

      <EditTemplateDialog
        template={editItem}
        open={!!editItem}
        onOpenChange={(open) => { if (!open) setEditItem(null); }}
      />

      <VersionHistoryDialog
        templateId={versionItem?.id || null}
        templateName={versionItem?.name}
        open={!!versionItem}
        onOpenChange={(open) => { if (!open) setVersionItem(null); }}
      />

      <CloneTemplateDialog
        templateId={cloneItem?.id || null}
        templateName={cloneItem?.name}
        open={!!cloneItem}
        onOpenChange={(open) => { if (!open) setCloneItem(null); }}
      />
    </div>
  );
}
