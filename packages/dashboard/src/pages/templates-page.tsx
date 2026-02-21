import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createTemplateSchema } from '@lpf/shared';
import type { CreateTemplateInput } from '@lpf/shared';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { api } from '@/lib/axios';

export function TemplatesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['templates', search],
    queryFn: async () => {
      const res = await api.get('/templates', { params: { search, limit: 50 } });
      return res.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/templates/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['templates'] }),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateTemplateInput) => api.post('/templates', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      setDialogOpen(false);
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateTemplateInput>({
    resolver: zodResolver(createTemplateSchema),
  });

  const onSubmit = (formData: CreateTemplateInput) => {
    createMutation.mutate(formData);
    reset();
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
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> New Template
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Template</DialogTitle>
            </DialogHeader>
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

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search templates..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data?.data?.map((template: any) => (
            <Card key={template.id}>
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
                    <DropdownMenuItem>
                      <Pencil className="mr-2 h-4 w-4" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => deleteMutation.mutate(template.id)}
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
                    <Badge key={tech} variant="outline" className="text-xs">
                      {tech}
                    </Badge>
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <Badge variant={statusColor(template.status)}>{template.status}</Badge>
                  <span className="text-xs text-muted-foreground">
                    {template._count?.projects ?? 0} projects
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
