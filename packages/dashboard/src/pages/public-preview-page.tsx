import { useState } from 'react';
import { useParams } from 'react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle, XCircle, MessageSquare, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { CommentThread } from '@/components/comment-thread';
import { api } from '@/lib/axios';

const approvalVariant = (status: string) => {
  switch (status) {
    case 'APPROVED': return 'default' as const;
    case 'CHANGES_REQUESTED': return 'destructive' as const;
    default: return 'secondary' as const;
  }
};

export function PublicPreviewPage() {
  const { token } = useParams<{ token: string }>();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('preview');

  const { data, isLoading, error } = useQuery({
    queryKey: ['portal', token],
    queryFn: async () => {
      const res = await api.get(`/portal/${token}`);
      return res.data.data;
    },
    enabled: !!token,
  });

  const approveMutation = useMutation({
    mutationFn: () => api.post(`/portal/${token}/approve`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portal', token] });
      toast.success('Project approved!');
    },
    onError: () => toast.error('Failed to approve'),
  });

  const requestChangesMutation = useMutation({
    mutationFn: () => api.post(`/portal/${token}/request-changes`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portal', token] });
      toast.success('Changes requested');
    },
    onError: () => toast.error('Failed to request changes'),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <Skeleton className="h-8 w-48 mb-4" />
        <Skeleton className="h-[600px] w-full" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="py-8 text-center">
            <h2 className="text-xl font-bold mb-2">Preview Not Available</h2>
            <p className="text-muted-foreground">
              This preview link is invalid or has expired.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { project, expiresAt } = data;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div>
            <h1 className="text-xl font-bold">{project.name}</h1>
            <p className="text-sm text-muted-foreground">
              {project.client?.name || project.client?.company}
              {' - '}
              {project.template.name}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant={approvalVariant(project.approvalStatus)}>
              {project.approvalStatus.replace('_', ' ')}
            </Badge>
            <div className="flex gap-2">
              <Button
                variant="default"
                size="sm"
                onClick={() => approveMutation.mutate()}
                disabled={approveMutation.isPending || project.approvalStatus === 'APPROVED'}
              >
                <CheckCircle className="mr-1 h-4 w-4" />
                Approve
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => requestChangesMutation.mutate()}
                disabled={requestChangesMutation.isPending}
              >
                <XCircle className="mr-1 h-4 w-4" />
                Request Changes
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="preview">
              <Eye className="mr-1 h-4 w-4" /> Preview
            </TabsTrigger>
            <TabsTrigger value="comments">
              <MessageSquare className="mr-1 h-4 w-4" /> Comments
            </TabsTrigger>
          </TabsList>

          <TabsContent value="preview" className="mt-4">
            <div className="overflow-hidden rounded-lg border bg-white">
              <iframe
                src={`/api/portal/${token}/preview`}
                className="h-[700px] w-full"
                title="Project Preview"
              />
            </div>
          </TabsContent>

          <TabsContent value="comments" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Comments</CardTitle>
              </CardHeader>
              <CardContent>
                <CommentThread
                  projectId={project.id}
                  isPortal
                  portalToken={token}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <p className="text-xs text-muted-foreground text-center mt-6">
          Preview link expires: {new Date(expiresAt).toLocaleDateString()}
        </p>
      </main>
    </div>
  );
}
