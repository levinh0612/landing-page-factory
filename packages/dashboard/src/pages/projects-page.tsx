import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Trash2, Pencil } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createProjectSchema, ProjectStatus } from '@lpf/shared';
import type { CreateProjectInput } from '@lpf/shared';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { api } from '@/lib/axios';

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

  const { data, isLoading } = useQuery({
    queryKey: ['projects', search, statusFilter],
    queryFn: async () => {
      const params: any = { search, limit: 50 };
      if (statusFilter) params.status = statusFilter;
      const res = await api.get('/projects', { params });
      return res.data;
    },
  });

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
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects'] }),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateProjectInput) => api.post('/projects', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setDialogOpen(false);
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateProjectInput>({
    resolver: zodResolver(createProjectSchema),
  });

  const onSubmit = (formData: CreateProjectInput) => {
    createMutation.mutate(formData);
    reset();
  };

  const statuses = Object.values(ProjectStatus);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Projects</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> New Project
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Project</DialogTitle>
            </DialogHeader>
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
                <select
                  {...register('clientId')}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                >
                  <option value="">Select client...</option>
                  {clientsData?.map((c: any) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                {errors.clientId && <p className="text-xs text-destructive">{errors.clientId.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Template</Label>
                <select
                  {...register('templateId')}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                >
                  <option value="">Select template...</option>
                  {templatesData?.map((t: any) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
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

      <div className="flex gap-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-1">
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
        <p className="text-muted-foreground">Loading...</p>
      ) : (
        <div className="rounded-md border">
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
                    <TableCell className="font-medium">{project.name}</TableCell>
                    <TableCell>{project.client?.name || '-'}</TableCell>
                    <TableCell>{project.template?.name || '-'}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(project.status)}>
                        {project.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>{project.domain || '-'}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => deleteMutation.mutate(project.id)}
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
      )}
    </div>
  );
}
