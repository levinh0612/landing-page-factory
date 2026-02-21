import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Paintbrush, Type, Sun, Moon } from 'lucide-react';
import { useThemeStore } from '@/stores/theme-store';

export function AppearancePage() {
  const { theme, toggleTheme } = useThemeStore();
  const setTheme = (t: 'light' | 'dark') => { if (theme !== t) toggleTheme(); };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Appearance</h1>
        <p className="text-muted-foreground">Customize the look and feel of your dashboard</p>
      </div>

      {/* Theme Mode */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Paintbrush className="h-5 w-5" /> Color Mode
          </CardTitle>
          <CardDescription>Choose between light and dark theme</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <button
              onClick={() => setTheme('light')}
              className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-colors ${
                theme === 'light' ? 'border-primary' : 'border-border hover:border-muted-foreground'
              }`}
            >
              <Sun className="h-6 w-6" />
              <span className="text-sm font-medium">Light</span>
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-colors ${
                theme === 'dark' ? 'border-primary' : 'border-border hover:border-muted-foreground'
              }`}
            >
              <Moon className="h-6 w-6" />
              <span className="text-sm font-medium">Dark</span>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Site Branding */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Type className="h-5 w-5" /> Site Branding
          </CardTitle>
          <CardDescription>Configure site name and branding</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Dashboard Title</Label>
            <Input defaultValue="Landing Page Factory" />
          </div>
          <div className="space-y-2">
            <Label>Tagline</Label>
            <Input defaultValue="Admin Dashboard" />
          </div>
          <Button>Save Branding</Button>
        </CardContent>
      </Card>
    </div>
  );
}
