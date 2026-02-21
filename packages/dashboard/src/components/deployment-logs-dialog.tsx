import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';

interface DeploymentLogsDialogProps {
  deployment: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const statusVariant = (status: string) => {
  switch (status) {
    case 'SUCCESS': return 'default' as const;
    case 'PENDING': case 'BUILDING': return 'secondary' as const;
    case 'FAILED': return 'destructive' as const;
    default: return 'outline' as const;
  }
};

export function DeploymentLogsDialog({ deployment, open, onOpenChange }: DeploymentLogsDialogProps) {
  if (!deployment) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Deployment Logs - {deployment.version}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Status: </span>
              <Badge variant={statusVariant(deployment.status)}>{deployment.status}</Badge>
            </div>
            <div>
              <span className="text-muted-foreground">Platform: </span>
              <span>{deployment.platform}</span>
            </div>
            {deployment.buildTime && (
              <div>
                <span className="text-muted-foreground">Build time: </span>
                <span>{(deployment.buildTime / 1000).toFixed(1)}s</span>
              </div>
            )}
          </div>

          {deployment.deployUrl && (
            <div className="text-sm">
              <span className="text-muted-foreground">URL: </span>
              <a
                href={deployment.deployUrl}
                target="_blank"
                rel="noreferrer"
                className="text-primary hover:underline"
              >
                {deployment.deployUrl}
              </a>
            </div>
          )}

          <div className="rounded-md bg-muted p-4">
            <pre className="text-xs font-mono whitespace-pre-wrap">
              {deployment.logs || 'No logs available'}
            </pre>
          </div>

          <div className="text-xs text-muted-foreground">
            Created: {new Date(deployment.createdAt).toLocaleString()}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
