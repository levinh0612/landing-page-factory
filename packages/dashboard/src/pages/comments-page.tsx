import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle, XCircle, AlertTriangle, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import api from '@/lib/axios';

const TABS = ['All', 'PENDING', 'APPROVED', 'SPAM', 'TRASH'];
const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  APPROVED: 'bg-green-100 text-green-800',
  SPAM: 'bg-red-100 text-red-800',
  TRASH: 'bg-gray-100 text-gray-800',
};

export function CommentsPage() {
  const [statusFilter, setStatusFilter] = useState('All');
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['site-comments', statusFilter],
    queryFn: async () => {
      const params = statusFilter !== 'All' ? `?status=${statusFilter}` : '';
      const res = await api.get(`/site-comments${params}`);
      return res.data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.patch(`/site-comments/${id}`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-comments'] });
      toast.success('Comment updated');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/site-comments/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-comments'] });
      toast.success('Comment deleted');
    },
  });

  const comments = data?.data ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Comments</h1>
        <p className="text-muted-foreground">Moderate site comments</p>
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

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading...</div>
      ) : (
        <div className="border rounded-lg divide-y">
          {comments.map((comment: any) => (
            <div key={comment.id} className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{comment.authorName}</span>
                    <span className="text-xs text-muted-foreground">{comment.email}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[comment.status]}`}>
                      {comment.status}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">{comment.content}</p>
                  {comment.post && (
                    <p className="text-xs text-muted-foreground">On: {comment.post.title}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    {format(new Date(comment.createdAt), 'MMM d, yyyy HH:mm')}
                  </p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button
                    variant="ghost" size="sm" className="text-green-600"
                    onClick={() => updateMutation.mutate({ id: comment.id, status: 'APPROVED' })}
                    title="Approve"
                  >
                    <CheckCircle className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost" size="sm" className="text-orange-500"
                    onClick={() => updateMutation.mutate({ id: comment.id, status: 'SPAM' })}
                    title="Mark as Spam"
                  >
                    <AlertTriangle className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost" size="sm" className="text-muted-foreground"
                    onClick={() => updateMutation.mutate({ id: comment.id, status: 'TRASH' })}
                    title="Move to Trash"
                  >
                    <XCircle className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete comment?</AlertDialogTitle>
                        <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteMutation.mutate(comment.id)}>Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          ))}
          {comments.length === 0 && (
            <div className="py-12 text-center text-muted-foreground">No comments found</div>
          )}
        </div>
      )}
    </div>
  );
}
