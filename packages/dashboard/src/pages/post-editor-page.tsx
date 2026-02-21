import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { Bold, Italic, List, ListOrdered, Link as LinkIcon, Code, Quote, Heading1, Heading2, Save, Globe } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import api from '@/lib/axios';

function ToolbarButton({ onClick, active, children, title }: { onClick: () => void; active?: boolean; children: React.ReactNode; title: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-1.5 rounded text-sm transition-colors ${
        active ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
      }`}
    >
      {children}
    </button>
  );
}

export function PostEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isNew = id === 'new';

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [status, setStatus] = useState('DRAFT');
  const [tagInput, setTagInput] = useState('');
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);

  const { data: postData } = useQuery({
    queryKey: ['post', id],
    queryFn: () => api.get(`/posts/${id}`).then((r) => r.data.data),
    enabled: !isNew,
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['post-categories'],
    queryFn: () => api.get('/posts/categories').then((r) => r.data.data),
  });

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: 'Write your post content here...' }),
    ],
    content: '',
  });

  useEffect(() => {
    if (postData && editor) {
      setTitle(postData.title);
      setSlug(postData.slug);
      setExcerpt(postData.excerpt ?? '');
      setStatus(postData.status);
      setSelectedCategoryIds(postData.categories?.map((c: any) => c.categoryId) ?? []);
      editor.commands.setContent(postData.content);
    }
  }, [postData, editor]);

  useEffect(() => {
    if (isNew && title) {
      setSlug(title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''));
    }
  }, [title, isNew]);

  const saveMutation = useMutation({
    mutationFn: async (publishStatus?: string) => {
      const payload = {
        title,
        slug,
        content: editor?.getHTML() ?? '',
        excerpt,
        status: publishStatus ?? status,
        categoryIds: selectedCategoryIds,
        publishedAt: publishStatus === 'PUBLISHED' ? new Date().toISOString() : undefined,
      };
      if (isNew) return api.post('/posts', payload);
      return api.patch(`/posts/${id}`, payload);
    },
    onSuccess: (res) => {
      toast.success(isNew ? 'Post created' : 'Post saved');
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      if (isNew) navigate(`/posts/${res.data.data.id}`);
    },
    onError: () => toast.error('Failed to save post'),
  });

  const categories = categoriesData ?? [];
  const toggleCategory = (catId: string) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(catId) ? prev.filter((id) => id !== catId) : [...prev, catId]
    );
  };

  if (!editor) return null;

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      {/* Main Editor */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="border-b px-4 py-2 flex gap-1 flex-wrap">
          <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Bold">
            <Bold className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italic">
            <Italic className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive('heading', { level: 1 })} title="H1">
            <Heading1 className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} title="H2">
            <Heading2 className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Bullet List">
            <List className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Numbered List">
            <ListOrdered className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive('code')} title="Code">
            <Code className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Blockquote">
            <Quote className="h-4 w-4" />
          </ToolbarButton>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <Input
            className="text-3xl font-bold border-0 shadow-none focus-visible:ring-0 p-0 mb-4 h-auto"
            placeholder="Post title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <EditorContent
            editor={editor}
            className="prose prose-sm max-w-none min-h-[400px] focus:outline-none [&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[400px]"
          />
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="w-72 border-l overflow-y-auto p-4 space-y-6">
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1" onClick={() => saveMutation.mutate(undefined)} disabled={saveMutation.isPending}>
            <Save className="h-4 w-4 mr-1" /> Save Draft
          </Button>
          <Button size="sm" className="flex-1" onClick={() => saveMutation.mutate('PUBLISHED')} disabled={saveMutation.isPending}>
            <Globe className="h-4 w-4 mr-1" /> Publish
          </Button>
        </div>

        <div className="space-y-2">
          <Label>Status</Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="DRAFT">Draft</SelectItem>
              <SelectItem value="PUBLISHED">Published</SelectItem>
              <SelectItem value="ARCHIVED">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Slug</Label>
          <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="post-slug" />
        </div>

        <div className="space-y-2">
          <Label>Excerpt</Label>
          <Textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} placeholder="Brief description..." rows={3} />
        </div>

        <div className="space-y-2">
          <Label>Categories</Label>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat: any) => (
              <Badge
                key={cat.id}
                variant={selectedCategoryIds.includes(cat.id) ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => toggleCategory(cat.id)}
              >
                {cat.name}
              </Badge>
            ))}
            {categories.length === 0 && <p className="text-xs text-muted-foreground">No categories yet</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
