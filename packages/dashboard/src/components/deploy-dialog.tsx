import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Rocket } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { api } from '@/lib/axios';

const DEPLOY_TARGETS = [
  { value: 'VERCEL', label: 'Vercel' },
  { value: 'NETLIFY', label: 'Netlify' },
  { value: 'CLOUDFLARE', label: 'Cloudflare Pages' },
];

interface DeployDialogProps {
  projectId: string | null;
  projectName?: string;
  deployTarget?: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeployDialog({ projectId, projectName, deployTarget, open, onOpenChange }: DeployDialogProps) {
  const queryClient = useQueryClient();
  const [selectedTarget, setSelectedTarget] = useState<string>(deployTarget || '');

  const effectiveTarget = deployTarget || selectedTarget;

  const saveTargetMutation = useMutation({
    mutationFn: (target: string) =>
      api.patch(`/projects/${projectId}`, { deployTarget: target }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
    },
  });

  const deployMutation = useMutation({
    mutationFn: async () => {
      // If no saved target yet, save it first
      if (!deployTarget && selectedTarget) {
        await saveTargetMutation.mutateAsync(selectedTarget);
      }
      return api.post(`/projects/${projectId}/deploy`);
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      toast.success(`Deployed successfully! URL: ${res.data.data.deployUrl || 'pending'}`);
      onOpenChange(false);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || 'Deployment failed');
    },
  });

  const canDeploy = !!effectiveTarget;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Deploy Project</DialogTitle>
          <DialogDescription>
            Deploy "{projectName}" to {effectiveTarget || 'a platform'}.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Deploy Target</Label>
            {deployTarget ? (
              <div className="flex items-center gap-2">
                <Badge variant="outline">{deployTarget}</Badge>
                <span className="text-xs text-muted-foreground">(saved on project)</span>
              </div>
            ) : (
              <Select value={selectedTarget} onValueChange={setSelectedTarget}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a platform..." />
                </SelectTrigger>
                <SelectContent>
                  {DEPLOY_TARGETS.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {!canDeploy && (
            <p className="text-sm text-muted-foreground">
              Select a deploy target above to continue.
            </p>
          )}

          {deployMutation.isPending && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent" />
              Building and deploying...
            </div>
          )}

          <Button
            onClick={() => deployMutation.mutate()}
            disabled={deployMutation.isPending || !canDeploy}
            className="w-full"
          >
            <Rocket className="mr-2 h-4 w-4" />
            {deployMutation.isPending ? 'Deploying...' : 'Start Deployment'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
