import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import api from '@/lib/axios';

const STATUS_COLORS: Record<string, string> = {
  PUBLISHED: 'bg-green-100 text-green-800',
  DRAFT: 'bg-yellow-100 text-yellow-800',
  ARCHIVED: 'bg-gray-100 text-gray-800',
};

const TABS = ['All', 'PUBLISHED', 'DRAFT', 'ARCHIVED'];

export function PagesPage() {
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['site-pages', statusFilter, search],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (statusFilter !== 'All') params.set('status', statusFilter);
      if (search) params.set('search', search);
      const res = await api.get(`/site-pages?${params}`);
      return res.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/site-pages/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-pages'] });
      toast.success('Page deleted');
    },
  });

  const pages = data?.data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Pages</h1>
          <p className="text-muted-foreground">Manage static site pages</p>
        </div>
        <Button onClick={() => navigate('/pages/new')}>
          <Plus className="h-4 w-4 mr-2" /> New Page
        </Button>
      </div>

      <div className="flex gap-1 border-b">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setStatusFilter(tab)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              statusFilter === tab ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search pages..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading...</div>
      ) : (
        <div className="overflow-x-auto"><div className="border rounded-lg overflow-hidden min-w-[560px]">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-3 font-medium">Title</th>
                <th className="text-left p-3 font-medium">Slug</th>
                <th className="text-left p-3 font-medium">Status</th>
                <th className="text-left p-3 font-medium">Updated</th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {pages.map((page: any) => (
                <tr key={page.id} className="hover:bg-muted/30">
                  <td className="p-3 font-medium">{page.title}</td>
                  <td className="p-3 text-muted-foreground font-mono text-xs">{page.slug}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[page.status]}`}>
                      {page.status}
                    </span>
                  </td>
                  <td className="p-3 text-muted-foreground">{format(new Date(page.updatedAt), 'MMM d, yyyy')}</td>
                  <td className="p-3">
                    <div className="flex gap-1 justify-end">
                      <Button variant="ghost" size="sm" onClick={() => navigate(`/pages/${page.id}`)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete page?</AlertDialogTitle>
                            <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteMutation.mutate(page.id)}>Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </td>
                </tr>
              ))}
              {pages.length === 0 && (
                <tr><td colSpan={5} className="p-12 text-center text-muted-foreground">No pages found</td></tr>
              )}
            </tbody>
          </table>
        </div></div>
      )}
    </div>
  );
}
