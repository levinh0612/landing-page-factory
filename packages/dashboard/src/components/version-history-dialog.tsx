import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { api } from '@/lib/axios';

interface VersionHistoryDialogProps {
  templateId: string | null;
  templateName?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function formatBytes(bytes: number) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function VersionHistoryDialog({ templateId, templateName, open, onOpenChange }: VersionHistoryDialogProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['template-versions', templateId],
    queryFn: async () => {
      const res = await api.get(`/templates/${templateId}/versions`);
      return res.data.data;
    },
    enabled: !!templateId && open,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Version History{templateName ? ` - ${templateName}` : ''}</DialogTitle>
        </DialogHeader>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : data?.length ? (
          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Version</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Files</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Uploaded By</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((v: any) => (
                  <TableRow key={v.id}>
                    <TableCell>
                      <Badge variant="outline" className="font-mono">v{v.version}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(v.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-sm">{v.fileCount} files</TableCell>
                    <TableCell className="text-sm">{formatBytes(v.fileSize)}</TableCell>
                    <TableCell className="text-sm">{v.uploader?.name || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-4">No versions uploaded yet</p>
        )}
      </DialogContent>
    </Dialog>
  );
}
