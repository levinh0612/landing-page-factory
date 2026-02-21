import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Copy, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { api } from '@/lib/axios';

interface PreviewLinkDialogProps {
  projectId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PreviewLinkDialog({ projectId, open, onOpenChange }: PreviewLinkDialogProps) {
  const queryClient = useQueryClient();
  const [expiresInDays, setExpiresInDays] = useState(7);

  const { data: tokens } = useQuery({
    queryKey: ['preview-tokens', projectId],
    queryFn: async () => {
      const res = await api.get(`/projects/${projectId}/preview-tokens`);
      return res.data.data;
    },
    enabled: !!projectId && open,
  });

  const generateMutation = useMutation({
    mutationFn: () => api.post(`/projects/${projectId}/preview-token`, { expiresInDays }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['preview-tokens', projectId] });
      toast.success('Preview link generated');
    },
    onError: () => toast.error('Failed to generate link'),
  });

  const revokeMutation = useMutation({
    mutationFn: (tokenId: string) =>
      api.delete(`/projects/${projectId}/preview-tokens/${tokenId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['preview-tokens', projectId] });
      toast.success('Token revoked');
    },
    onError: () => toast.error('Failed to revoke token'),
  });

  const copyLink = (token: string) => {
    const url = `${window.location.origin}/preview/${token}`;
    navigator.clipboard.writeText(url);
    toast.success('Link copied to clipboard');
  };

  const isExpired = (expiresAt: string) => new Date(expiresAt) < new Date();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Client Preview Links</DialogTitle>
        </DialogHeader>

        <div className="flex items-end gap-3">
          <div className="space-y-2 flex-1">
            <Label>Expires in (days)</Label>
            <Input
              type="number"
              min={1}
              max={90}
              value={expiresInDays}
              onChange={(e) => setExpiresInDays(Number(e.target.value))}
            />
          </div>
          <Button onClick={() => generateMutation.mutate()} disabled={generateMutation.isPending}>
            {generateMutation.isPending ? 'Generating...' : 'Generate Link'}
          </Button>
        </div>

        {tokens?.length ? (
          <div className="overflow-x-auto rounded-md border mt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Token</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tokens.map((t: any) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-mono text-xs max-w-[200px] truncate">
                      {t.token.slice(0, 16)}...
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(t.expiresAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant={isExpired(t.expiresAt) ? 'destructive' : 'default'}>
                        {isExpired(t.expiresAt) ? 'Expired' : 'Active'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => copyLink(t.token)}
                          title="Copy link"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => revokeMutation.mutate(t.id)}
                          title="Revoke"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-4">No preview links generated yet</p>
        )}
      </DialogContent>
    </Dialog>
  );
}
