import { useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { updateTemplateSchema, TemplateStatus } from '@lpf/shared';
import type { UpdateTemplateInput } from '@lpf/shared';
import { toast } from 'sonner';
import { ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { api } from '@/lib/axios';
import { TemplateUpload } from './template-upload';

interface EditTemplateDialogProps {
  template: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditTemplateDialog({ template, open, onOpenChange }: EditTemplateDialogProps) {
  const queryClient = useQueryClient();

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<UpdateTemplateInput>({
    resolver: zodResolver(updateTemplateSchema),
  });

  useEffect(() => {
    if (template && open) {
      reset({
        name: template.name,
        slug: template.slug,
        category: template.category,
        description: template.description || '',
        status: template.status,
        previewUrl: template.previewUrl || undefined,
        thumbnailUrl: template.thumbnailUrl || undefined,
      });
    }
  }, [template, open, reset]);

  const updateMutation = useMutation({
    mutationFn: (data: UpdateTemplateInput) => api.patch(`/templates/${template.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      toast.success('Template updated');
      onOpenChange(false);
    },
    onError: () => toast.error('Failed to update template'),
  });

  const onSubmit = (data: UpdateTemplateInput) => updateMutation.mutate(data);

  const statusValue = watch('status');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader><DialogTitle>Edit Template</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input {...register('name')} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>Slug</Label>
            <Input {...register('slug')} />
            {errors.slug && <p className="text-xs text-destructive">{errors.slug.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>Category</Label>
            <Input {...register('category')} />
            {errors.category && <p className="text-xs text-destructive">{errors.category.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea {...register('description')} rows={3} />
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={statusValue} onValueChange={(v) => setValue('status', v as TemplateStatus)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.values(TemplateStatus).map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Preview URL</Label>
            <Input {...register('previewUrl')} placeholder="https://..." />
          </div>
          <div className="space-y-2">
            <Label>Thumbnail URL</Label>
            <Input {...register('thumbnailUrl')} placeholder="https://..." />
          </div>
          <Button type="submit" className="w-full" disabled={updateMutation.isPending}>
            {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </form>

        {template && (
          <>
            <Separator />
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Template Files</h3>
              <TemplateUpload
                templateId={template.id}
                currentVersion={template.version ?? 0}
              />
              {(template.version ?? 0) > 0 && (
                <Button variant="outline" size="sm" asChild>
                  <a
                    href={`/api/templates/${template.id}/preview`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Preview Template
                  </a>
                </Button>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
