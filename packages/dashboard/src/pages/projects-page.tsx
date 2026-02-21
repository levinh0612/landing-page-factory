import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Trash2, Pencil } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createProjectSchema, ProjectStatus } from '@lpf/shared';
import type { CreateProjectInput } from '@lpf/shared';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { api } from '@/lib/axios';
import { useDebounce } from '@/hooks/use-debounce';
import { usePagination } from '@/hooks/use-pagination';
import { PaginationControls } from '@/components/pagination-controls';
import { EditProjectDialog } from '@/components/edit-project-dialog';

const statusVariant = (status: string) => {
  switch (status) {
    case 'DEPLOYED': return 'default' as const;
    case 'IN_PROGRESS': return 'secondary' as const;
    case 'READY': return 'outline' as const;
    case 'ARCHIVED': return 'destructive' as const;
    default: return 'outline' as const;
  }
};

export function ProjectsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);

  const debouncedSearch = useDebounce(search);
  const { page, limit, setPage, setLimit, resetPage, meta, setMeta } = usePagination();

  useEffect(() => { resetPage(); }, [debouncedSearch, statusFilter, resetPage]);

  const { data, isLoading } = useQuery({
    queryKey: ['projects', debouncedSearch, statusFilter, page, limit],
    queryFn: async () => {
      const params: Record<string, unknown> = { search: debouncedSearch, page, limit };
      if (statusFilter) params.status = statusFilter;
      const res = await api.get('/projects', { params });
      return res.data;
    },
  });

  useEffect(() => {
    if (data?.meta) setMeta({ total: data.meta.total, totalPages: data.meta.totalPages });
  }, [data?.meta, setMeta]);

  const { data: clientsData } = useQuery({
    queryKey: ['clients-select'],
    queryFn: async () => {
      const res = await api.get('/clients', { params: { limit: 100 } });
      return res.data.data;
    },
  });

  const { data: templatesData } = useQuery({
    queryKey: ['templates-select'],
    queryFn: async () => {
      const res = await api.get('/templates', { params: { limit: 100 } });
      return res.data.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/projects/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Project deleted');
    },
    onError: () => toast.error('Failed to delete project'),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateProjectInput) => api.post('/projects', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setDialogOpen(false);
      toast.success('Project created');
    },
    onError: () => toast.error('Failed to create project'),
  });

  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<CreateProjectInput>({
    resolver: zodResolver(createProjectSchema),
  });

  const onSubmit = (formData: CreateProjectInput) => {
    createMutation.mutate(formData);
    reset();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      deleteMutation.mutate(id);
    }
  };

  const statuses = Object.values(ProjectStatus);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Projects</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" /> New Project</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create Project</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input {...register('name')} />
                {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Slug</Label>
                <Input {...register('slug')} placeholder="my-project" />
                {errors.slug && <p className="text-xs text-destructive">{errors.slug.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Client</Label>
                <Controller
                  name="clientId"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select client..." />
                      </SelectTrigger>
                      <SelectContent>
                        {clientsData?.map((c: any) => (
                          <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.clientId && <p className="text-xs text-destructive">{errors.clientId.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Template</Label>
                <Controller
                  name="templateId"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select template..." />
                      </SelectTrigger>
                      <SelectContent>
                        {templatesData?.map((t: any) => (
                          <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.templateId && <p className="text-xs text-destructive">{errors.templateId.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Domain (optional)</Label>
                <Input {...register('domain')} placeholder="example.com" />
              </div>
              <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Creating...' : 'Create'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-1">
          <Button
            variant={statusFilter === '' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('')}
          >
            All
          </Button>
          {statuses.map((s) => (
            <Button
              key={s}
              variant={statusFilter === s ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter(s)}
            >
              {s.replace('_', ' ')}
            </Button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Template</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Domain</TableHead>
                  <TableHead className="w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.data?.length ? (
                  data.data.map((project: any) => (
                    <TableRow key={project.id}>
                      <TableCell className="font-medium">
                        <Link to={`/projects/${project.id}`} className="hover:underline text-primary">
                          {project.name}
                        </Link>
                      </TableCell>
                      <TableCell>{project.client?.name || '-'}</TableCell>
                      <TableCell>{project.template?.name || '-'}</TableCell>
                      <TableCell>
                        <Badge variant={statusVariant(project.status)}>
                          {project.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>{project.domain || project.deployUrl || '-'}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditItem(project)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={() => handleDelete(project.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      No projects found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
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

      <EditProjectDialog
        project={editItem}
        open={!!editItem}
        onOpenChange={(open) => { if (!open) setEditItem(null); }}
      />
    </div>
  );
}
