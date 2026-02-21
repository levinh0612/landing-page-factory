import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Rocket } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { api } from '@/lib/axios';

interface DeployDialogProps {
  projectId: string | null;
  projectName?: string;
  deployTarget?: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeployDialog({ projectId, projectName, deployTarget, open, onOpenChange }: DeployDialogProps) {
  const queryClient = useQueryClient();

  const deployMutation = useMutation({
    mutationFn: () => api.post(`/projects/${projectId}/deploy`),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      toast.success(`Deployed successfully! URL: ${res.data.data.deployUrl || 'pending'}`);
      onOpenChange(false);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || 'Deployment failed');
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Deploy Project</DialogTitle>
          <DialogDescription>
            Deploy "{projectName}" to {deployTarget || 'configured platform'}.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Target:</span>
            <Badge variant="outline">{deployTarget || 'Not configured'}</Badge>
          </div>

          {!deployTarget ? (
            <p className="text-sm text-destructive">
              Please configure a deploy target in project settings first.
            </p>
          ) : (
            <>
              {deployMutation.isPending && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent" />
                  Building and deploying...
                </div>
              )}
              <Button
                onClick={() => deployMutation.mutate()}
                disabled={deployMutation.isPending || !deployTarget}
                className="w-full"
              >
                <Rocket className="mr-2 h-4 w-4" />
                {deployMutation.isPending ? 'Deploying...' : 'Start Deployment'}
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
