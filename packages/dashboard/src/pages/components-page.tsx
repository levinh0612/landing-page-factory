import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

interface ComponentSpec {
  name: string;
  description: string;
  code: string;
  demo: React.ReactNode;
}

const CATEGORIES = [
  { id: 'buttons', label: 'Buttons' },
  { id: 'inputs', label: 'Inputs' },
  { id: 'feedback', label: 'Feedback' },
  { id: 'data-display', label: 'Data Display' },
  { id: 'layout', label: 'Layout' },
];

const COMPONENTS: Record<string, ComponentSpec[]> = {
  buttons: [
    {
      name: 'Button Variants',
      description: 'Primary action buttons with different visual weights',
      code: `<Button>Default</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="destructive">Destructive</Button>`,
      demo: (
        <div className="flex gap-2 flex-wrap">
          <Button>Default</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
        </div>
      ),
    },
    {
      name: 'Button Sizes',
      description: 'Size variants for different contexts',
      code: `<Button size="sm">Small</Button>
<Button>Default</Button>
<Button size="lg">Large</Button>`,
      demo: (
        <div className="flex items-center gap-2">
          <Button size="sm">Small</Button>
          <Button>Default</Button>
          <Button size="lg">Large</Button>
        </div>
      ),
    },
  ],
  inputs: [
    {
      name: 'Input Field',
      description: 'Standard text input with label',
      code: `<div className="space-y-2">
  <Label htmlFor="email">Email</Label>
  <Input id="email" placeholder="Enter email..." type="email" />
</div>`,
      demo: (
        <div className="space-y-2 max-w-sm">
          <Label htmlFor="demo-email">Email</Label>
          <Input id="demo-email" placeholder="Enter email..." type="email" />
        </div>
      ),
    },
    {
      name: 'Textarea',
      description: 'Multi-line text input',
      code: `<Textarea placeholder="Type your message..." rows={4} />`,
      demo: <Textarea placeholder="Type your message..." rows={3} className="max-w-sm" />,
    },
    {
      name: 'Toggle Switch',
      description: 'Binary on/off toggle',
      code: `<div className="flex items-center gap-2">
  <Switch id="toggle" />
  <Label htmlFor="toggle">Enable feature</Label>
</div>`,
      demo: (
        <div className="flex items-center gap-2">
          <Switch id="demo-toggle" />
          <Label htmlFor="demo-toggle">Enable feature</Label>
        </div>
      ),
    },
  ],
  feedback: [
    {
      name: 'Alert',
      description: 'Contextual feedback messages',
      code: `<Alert>
  <AlertTitle>Heads up!</AlertTitle>
  <AlertDescription>This is an informational alert.</AlertDescription>
</Alert>`,
      demo: (
        <Alert className="max-w-md">
          <AlertTitle>Heads up!</AlertTitle>
          <AlertDescription>This is an informational alert message.</AlertDescription>
        </Alert>
      ),
    },
    {
      name: 'Badge',
      description: 'Small status labels',
      code: `<Badge>Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="outline">Outline</Badge>
<Badge variant="destructive">Destructive</Badge>`,
      demo: (
        <div className="flex gap-2">
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="destructive">Destructive</Badge>
        </div>
      ),
    },
  ],
  'data-display': [
    {
      name: 'Card',
      description: 'Content container with header and body',
      code: `<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Card content goes here.</p>
  </CardContent>
</Card>`,
      demo: (
        <Card className="max-w-sm">
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
            <CardDescription>Card description text</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">Card content goes here.</p>
          </CardContent>
        </Card>
      ),
    },
  ],
  layout: [
    {
      name: 'Separator',
      description: 'Visual divider between content sections',
      code: `<div>
  <p>Above</p>
  <Separator className="my-4" />
  <p>Below</p>
</div>`,
      demo: (
        <div className="max-w-sm">
          <p className="text-sm">Above separator</p>
          <Separator className="my-4" />
          <p className="text-sm">Below separator</p>
        </div>
      ),
    },
  ],
};

function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <Button variant="ghost" size="sm" onClick={copy} className="h-7">
      {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
    </Button>
  );
}

export function ComponentsPage() {
  const [activeCategory, setActiveCategory] = useState('buttons');
  const components = COMPONENTS[activeCategory] ?? [];

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Category Sidebar */}
      <aside className="w-52 border-r overflow-y-auto">
        <div className="p-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Categories</h2>
          <nav className="space-y-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                  activeCategory === cat.id
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </nav>
        </div>
      </aside>

      {/* Component Preview Area */}
      <div className="flex-1 overflow-y-auto p-6">
        <h1 className="text-2xl font-bold mb-1">{CATEGORIES.find((c) => c.id === activeCategory)?.label}</h1>
        <p className="text-muted-foreground mb-6">UI component showcase with live previews and code snippets</p>

        <div className="space-y-6">
          {components.map((comp) => (
            <Card key={comp.name}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{comp.name}</CardTitle>
                    <CardDescription>{comp.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Live Demo */}
                <div className="rounded-lg border bg-background p-6">
                  {comp.demo}
                </div>
                {/* Code Snippet */}
                <div className="relative rounded-lg bg-muted/60 border">
                  <div className="flex items-center justify-between px-4 py-2 border-b">
                    <span className="text-xs text-muted-foreground font-mono">JSX</span>
                    <CopyButton code={comp.code} />
                  </div>
                  <pre className="p-4 text-xs font-mono overflow-x-auto text-foreground/80">
                    {comp.code}
                  </pre>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
