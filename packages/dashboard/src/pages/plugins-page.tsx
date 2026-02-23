import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Package, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import api from '@/lib/axios';
import type { Plugin } from '@lpf/shared';

const CATEGORY_ICONS: Record<string, string> = {
  booking: '📅',
  contact: '📬',
  payment: '💳',
  analytics: '📊',
  seo: '🔍',
  chat: '💬',
  gallery: '🖼️',
  video: '▶️',
  countdown: '⏱️',
};

export function PluginsPage() {
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['plugins'],
    queryFn: async () => {
      const res = await api.get('/plugins');
      return res.data.data as Plugin[];
    },
  });

  const plugins = (data ?? []).filter(
    (p) =>
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Plugins</h1>
          <p className="text-muted-foreground">Available plugins — enable them per project in Project → Plugins tab</p>
        </div>
        <Badge variant="outline">
          <Package className="h-3.5 w-3.5 mr-1" />
          {data?.length ?? 0} available
        </Badge>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search plugins..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading plugins...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {plugins.map((plugin) => (
            <Card key={plugin.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{plugin.icon ?? CATEGORY_ICONS[plugin.category] ?? '🔌'}</span>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-sm">{plugin.name}</CardTitle>
                    <div className="flex gap-1 mt-1 flex-wrap">
                      <Badge variant="secondary" className="text-xs capitalize">{plugin.category}</Badge>
                      {plugin.isBuiltIn && <Badge variant="outline" className="text-xs">Built-in</Badge>}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-xs">{plugin.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
          {plugins.length === 0 && (
            <p className="col-span-full text-center text-muted-foreground py-12">No plugins found</p>
          )}
        </div>
      )}
    </div>
  );
}
