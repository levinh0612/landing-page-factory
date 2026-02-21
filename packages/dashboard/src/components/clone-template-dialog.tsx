import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { cloneTemplateSchema } from '@lpf/shared';
import type { CloneTemplateInput } from '@lpf/shared';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { api } from '@/lib/axios';

interface CloneTemplateDialogProps {
  templateId: string | null;
  templateName?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CloneTemplateDialog({ templateId, templateName, open, onOpenChange }: CloneTemplateDialogProps) {
  const queryClient = useQueryClient();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CloneTemplateInput>({
    resolver: zodResolver(cloneTemplateSchema),
  });

  const cloneMutation = useMutation({
    mutationFn: (data: CloneTemplateInput) =>
      api.post(`/templates/${templateId}/clone`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      onOpenChange(false);
      reset();
      toast.success('Template cloned successfully');
    },
    onError: () => toast.error('Failed to clone template'),
  });

  const onSubmit = (data: CloneTemplateInput) => {
    cloneMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Clone Template{templateName ? ` - ${templateName}` : ''}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>New Name</Label>
            <Input {...register('name')} placeholder="My Cloned Template" />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>New Slug</Label>
            <Input {...register('slug')} placeholder="my-cloned-template" />
            {errors.slug && <p className="text-xs text-destructive">{errors.slug.message}</p>}
          </div>
          <Button type="submit" className="w-full" disabled={cloneMutation.isPending}>
            {cloneMutation.isPending ? 'Cloning...' : 'Clone'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
