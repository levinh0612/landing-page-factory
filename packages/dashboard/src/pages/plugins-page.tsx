import { useState } from 'react';
import { Package, CheckCircle, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

const MOCK_PLUGINS = [
  { id: '1', name: 'Analytics Pro', description: 'Track page views, conversions, and user behavior', category: 'Analytics', installed: false, icon: '📊' },
  { id: '2', name: 'SEO Optimizer', description: 'Automated meta tags, sitemap generation, schema markup', category: 'SEO', installed: true, icon: '🔍' },
  { id: '3', name: 'Payment Gateway', description: 'Accept payments via Stripe, PayPal, and local processors', category: 'Payments', installed: false, icon: '💳' },
  { id: '4', name: 'Live Chat', description: 'Embed live chat widget on client websites', category: 'Support', installed: false, icon: '💬' },
  { id: '5', name: 'Form Builder', description: 'Drag-and-drop form builder with email notifications', category: 'Tools', installed: true, icon: '📝' },
  { id: '6', name: 'Image Optimizer', description: 'Automatic WebP conversion and lazy loading', category: 'Performance', installed: false, icon: '🖼️' },
];

export function PluginsPage() {
  const [search, setSearch] = useState('');
  const [installed, setInstalled] = useState<Set<string>>(
    new Set(MOCK_PLUGINS.filter((p) => p.installed).map((p) => p.id))
  );

  const filtered = MOCK_PLUGINS.filter(
    (p) => p.name.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase())
  );

  const toggleInstall = (id: string) => {
    setInstalled((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Plugins</h1>
          <p className="text-muted-foreground">Extend your platform with plugins</p>
        </div>
        <Badge variant="outline">{installed.size} installed</Badge>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search plugins..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Plugin Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((plugin) => {
          const isInstalled = installed.has(plugin.id);
          return (
            <Card key={plugin.id} className={isInstalled ? 'border-primary/50' : ''}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{plugin.icon}</span>
                    <div>
                      <CardTitle className="text-sm flex items-center gap-1.5">
                        {plugin.name}
                        {isInstalled && <CheckCircle className="h-3.5 w-3.5 text-green-500" />}
                      </CardTitle>
                      <Badge variant="outline" className="text-xs mt-0.5">{plugin.category}</Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-xs mb-4">{plugin.description}</CardDescription>
                <Button
                  size="sm"
                  variant={isInstalled ? 'outline' : 'default'}
                  className="w-full"
                  onClick={() => toggleInstall(plugin.id)}
                >
                  {isInstalled ? (
                    'Uninstall'
                  ) : (
                    <>
                      <Plus className="h-3.5 w-3.5 mr-1" /> Install
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
