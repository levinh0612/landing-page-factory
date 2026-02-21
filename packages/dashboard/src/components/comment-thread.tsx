import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Send } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/axios';

interface CommentThreadProps {
  projectId: string;
  isPortal?: boolean;
  portalToken?: string;
}

export function CommentThread({ projectId, isPortal, portalToken }: CommentThreadProps) {
  const queryClient = useQueryClient();
  const [content, setContent] = useState('');
  const [authorName, setAuthorName] = useState('');

  const queryKey = isPortal
    ? ['portal-comments', portalToken]
    : ['comments', projectId];

  const { data: comments, isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      const url = isPortal
        ? `/portal/${portalToken}/comments`
        : `/projects/${projectId}/comments`;
      const res = await api.get(url);
      return res.data.data;
    },
  });

  const addCommentMutation = useMutation({
    mutationFn: async () => {
      const url = isPortal
        ? `/portal/${portalToken}/comments`
        : `/projects/${projectId}/comments`;
      return api.post(url, {
        authorName: isPortal ? authorName : 'Admin',
        content,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      setContent('');
      toast.success('Comment added');
    },
    onError: () => toast.error('Failed to add comment'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    if (isPortal && !authorName.trim()) {
      toast.error('Please enter your name');
      return;
    }
    addCommentMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3 max-h-[400px] overflow-y-auto">
        {comments?.length ? (
          comments.map((comment: any) => (
            <div
              key={comment.id}
              className={`rounded-lg p-3 ${
                comment.isClient
                  ? 'bg-blue-50 dark:bg-blue-950 ml-4'
                  : 'bg-muted mr-4'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">
                  {comment.authorName}
                  {comment.isClient && (
                    <span className="ml-2 text-xs text-blue-600 dark:text-blue-400">(Client)</span>
                  )}
                </span>
                <span className="text-xs text-muted-foreground">
                  {new Date(comment.createdAt).toLocaleString()}
                </span>
              </div>
              <p className="text-sm">{comment.content}</p>
            </div>
          ))
        ) : (
          <p className="text-center text-muted-foreground py-4">No comments yet</p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        {isPortal && (
          <Input
            placeholder="Your name"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            className="max-w-[150px]"
          />
        )}
        <Input
          placeholder="Add a comment..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" size="icon" disabled={addCommentMutation.isPending}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
