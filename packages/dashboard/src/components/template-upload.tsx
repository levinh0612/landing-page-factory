import { useState, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Upload, FileArchive, Check } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/axios';

interface TemplateUploadProps {
  templateId: string;
  currentVersion: number;
  onSuccess?: () => void;
}

export function TemplateUpload({ templateId, currentVersion, onSuccess }: TemplateUploadProps) {
  const queryClient = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('template', file);
      return api.post(`/templates/${templateId}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      queryClient.invalidateQueries({ queryKey: ['template', templateId] });
      setSelectedFile(null);
      if (fileRef.current) fileRef.current.value = '';
      toast.success('Template uploaded successfully');
      onSuccess?.();
    },
    onError: (err: any) => {
      const message = err.response?.data?.error || 'Failed to upload template';
      toast.error(message);
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setSelectedFile(file);
  };

  const handleUpload = () => {
    if (selectedFile) uploadMutation.mutate(selectedFile);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <FileArchive className="h-4 w-4" />
        <span>Current version: <strong>v{currentVersion}</strong></span>
        {currentVersion > 0 && <Check className="h-4 w-4 text-green-500" />}
      </div>
      <div className="flex items-center gap-2">
        <input
          ref={fileRef}
          type="file"
          accept=".zip"
          onChange={handleFileChange}
          className="flex-1 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-primary-foreground hover:file:bg-primary/90 cursor-pointer"
        />
        <Button
          size="sm"
          onClick={handleUpload}
          disabled={!selectedFile || uploadMutation.isPending}
        >
          <Upload className="mr-2 h-4 w-4" />
          {uploadMutation.isPending ? 'Uploading...' : 'Upload'}
        </Button>
      </div>
      {selectedFile && (
        <p className="text-xs text-muted-foreground">
          Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
        </p>
      )}
    </div>
  );
}
