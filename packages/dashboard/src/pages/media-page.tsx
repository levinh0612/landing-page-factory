import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDropzone } from 'react-dropzone';
import { Upload, Grid, List, Trash2, Copy, Image, FileText, Video, File } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import api from '@/lib/axios';

interface MediaFile {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  alt: string | null;
  createdAt: string;
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1024 / 1024).toFixed(1) + ' MB';
}

function MediaIcon({ mimeType }: { mimeType: string }) {
  if (mimeType.startsWith('image/')) return <Image className="h-8 w-8 text-blue-500" />;
  if (mimeType.startsWith('video/')) return <Video className="h-8 w-8 text-purple-500" />;
  if (mimeType === 'application/pdf') return <FileText className="h-8 w-8 text-red-500" />;
  return <File className="h-8 w-8 text-gray-500" />;
}

export function MediaPage() {
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [typeFilter, setTypeFilter] = useState('all');
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['media', typeFilter],
    queryFn: async () => {
      const params = typeFilter !== 'all' ? `?type=${typeFilter}` : '';
      const res = await api.get(`/media${params}`);
      return res.data;
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      return api.post('/media/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media'] });
      toast.success('File uploaded successfully');
    },
    onError: () => toast.error('Upload failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/media/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media'] });
      toast.success('File deleted');
    },
    onError: () => toast.error('Delete failed'),
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach((file) => uploadMutation.mutate(file));
  }, [uploadMutation]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(window.location.origin + url);
    toast.success('URL copied to clipboard');
  };

  const files: MediaFile[] = data?.data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Media Library</h1>
          <p className="text-muted-foreground">Upload and manage your media files</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setView(view === 'grid' ? 'list' : 'grid')}>
            {view === 'grid' ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
        <p className="text-sm font-medium">
          {isDragActive ? 'Drop files here' : 'Drag & drop files, or click to browse'}
        </p>
        <p className="text-xs text-muted-foreground mt-1">Images, videos, PDFs up to 20MB</p>
        {uploadMutation.isPending && <p className="text-xs text-primary mt-2">Uploading...</p>}
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="image">Images</SelectItem>
            <SelectItem value="video">Videos</SelectItem>
            <SelectItem value="application/pdf">PDFs</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-sm text-muted-foreground self-center">{files.length} files</p>
      </div>

      {/* Grid View */}
      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading...</div>
      ) : view === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
          {files.map((file) => (
            <Card key={file.id} className="group overflow-hidden">
              <CardContent className="p-2">
                <div className="aspect-square bg-muted rounded flex items-center justify-center overflow-hidden mb-2">
                  {file.mimeType.startsWith('image/') ? (
                    <img src={file.url} alt={file.alt ?? file.originalName} className="w-full h-full object-cover" />
                  ) : (
                    <MediaIcon mimeType={file.mimeType} />
                  )}
                </div>
                <p className="text-xs font-medium truncate" title={file.originalName}>{file.originalName}</p>
                <p className="text-xs text-muted-foreground">{formatBytes(file.size)}</p>
                <div className="flex gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => copyUrl(file.url)}>
                    <Copy className="h-3 w-3" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-destructive">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete file?</AlertDialogTitle>
                        <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteMutation.mutate(file.id)}>Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        /* List View */
        <div className="border rounded-lg divide-y">
          {files.map((file) => (
            <div key={file.id} className="flex items-center gap-3 p-3 hover:bg-muted/50">
              <MediaIcon mimeType={file.mimeType} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{file.originalName}</p>
                <p className="text-xs text-muted-foreground">{file.mimeType} · {formatBytes(file.size)}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => copyUrl(file.url)}>
                  <Copy className="h-4 w-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete file?</AlertDialogTitle>
                      <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => deleteMutation.mutate(file.id)}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
          {files.length === 0 && (
            <div className="py-12 text-center text-muted-foreground">No files found</div>
          )}
        </div>
      )}
    </div>
  );
}
