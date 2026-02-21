import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import api from '@/lib/axios';

const SECTIONS = [
  { id: 'general', label: 'General' },
  { id: 'media', label: 'Media' },
  { id: 'email', label: 'Email' },
  { id: 'security', label: 'Security' },
  { id: 'integrations', label: 'API & Integrations' },
];

const DEFAULT_SETTINGS: Record<string, Array<{ key: string; label: string; type?: string; placeholder?: string }>> = {
  general: [
    { key: 'site_name', label: 'Site Name', placeholder: 'My Website' },
    { key: 'site_description', label: 'Description', placeholder: 'A great website' },
    { key: 'site_url', label: 'Site URL', placeholder: 'https://example.com' },
    { key: 'timezone', label: 'Timezone', placeholder: 'UTC' },
    { key: 'language', label: 'Language', placeholder: 'en' },
  ],
  media: [
    { key: 'max_upload_size_mb', label: 'Max Upload Size (MB)', type: 'number', placeholder: '20' },
    { key: 'allowed_types', label: 'Allowed File Types', placeholder: 'image/*, video/*, application/pdf' },
    { key: 'image_max_width', label: 'Max Image Width (px)', type: 'number', placeholder: '2048' },
  ],
  email: [
    { key: 'resend_api_key', label: 'Resend API Key', type: 'password', placeholder: 're_...' },
    { key: 'from_email', label: 'From Email', type: 'email', placeholder: 'noreply@example.com' },
    { key: 'admin_email', label: 'Admin Email', type: 'email', placeholder: 'admin@example.com' },
  ],
  security: [
    { key: 'session_timeout_hours', label: 'Session Timeout (hours)', type: 'number', placeholder: '24' },
    { key: 'min_password_length', label: 'Min Password Length', type: 'number', placeholder: '8' },
  ],
  integrations: [
    { key: 'vercel_token', label: 'Vercel Token', type: 'password', placeholder: '••••••••' },
    { key: 'netlify_token', label: 'Netlify Token', type: 'password', placeholder: '••••••••' },
    { key: 'payos_client_id', label: 'PayOS Client ID', placeholder: '' },
    { key: 'payos_api_key', label: 'PayOS API Key', type: 'password', placeholder: '••••••••' },
  ],
};

export function SettingsPage() {
  const [activeSection, setActiveSection] = useState('general');
  const [values, setValues] = useState<Record<string, string>>({});

  const { data, isLoading } = useQuery({
    queryKey: ['settings', activeSection],
    queryFn: () => api.get(`/settings?section=${activeSection}`).then((r) => r.data.data),
  });

  useEffect(() => {
    if (data) {
      const map: Record<string, string> = {};
      data.forEach((s: any) => { map[s.key] = s.value; });
      setValues(map);
    }
  }, [data]);

  const saveMutation = useMutation({
    mutationFn: () => {
      const fields = DEFAULT_SETTINGS[activeSection] ?? [];
      const settings = fields.map(({ key }) => ({ key, value: values[key] ?? '' }));
      return api.put('/settings', { settings });
    },
    onSuccess: () => toast.success('Settings saved'),
    onError: () => toast.error('Failed to save settings'),
  });

  const fields = DEFAULT_SETTINGS[activeSection] ?? [];

  return (
    <div className="flex flex-col md:flex-row md:h-[calc(100vh-4rem)]">
      {/* Sidebar — horizontal on mobile, vertical on desktop */}
      <aside className="md:w-52 border-b md:border-b-0 md:border-r overflow-x-auto md:overflow-y-auto shrink-0">
        <div className="p-3 md:p-4">
          <h2 className="hidden md:block text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Settings</h2>
          <nav className="flex md:flex-col gap-1 md:space-y-1">
            {SECTIONS.map((sec) => (
              <button
                key={sec.id}
                onClick={() => setActiveSection(sec.id)}
                className={`shrink-0 text-left px-3 py-2 rounded-md text-sm transition-colors ${
                  activeSection === sec.id
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                {sec.label}
              </button>
            ))}
          </nav>
        </div>
      </aside>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="max-w-2xl">
          <h1 className="text-2xl font-bold mb-1 capitalize">{activeSection} Settings</h1>
          <p className="text-muted-foreground mb-6">Configure your {activeSection} preferences</p>

          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">Loading...</div>
          ) : (
            <Card>
              <CardContent className="pt-6 space-y-5">
                {fields.map((field) => (
                  <div key={field.key} className="space-y-2">
                    <Label htmlFor={field.key}>{field.label}</Label>
                    <Input
                      id={field.key}
                      type={field.type ?? 'text'}
                      placeholder={field.placeholder}
                      value={values[field.key] ?? ''}
                      onChange={(e) => setValues((prev) => ({ ...prev, [field.key]: e.target.value }))}
                    />
                  </div>
                ))}
                <Separator />
                <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? 'Saving...' : 'Save Settings'}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
