import { useState, useRef, useEffect } from 'react';
import { Loader, Copy, Download } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuthStore } from '@/stores/auth-store';

export function GeneratorPage() {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedHtml, setGeneratedHtml] = useState('');
  const [error, setError] = useState('');
  const [iframeKey, setIframeKey] = useState(0);
  const authToken = useAuthStore((state) => state.token);

  const handleGenerateWebsite = async () => {
    setError('');
    setGeneratedHtml('');

    if (!prompt.trim()) {
      setError('Please enter a website description');
      toast.error('Please enter a website description');
      return;
    }

    setIsLoading(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:5001';
      const response = await fetch(`${apiUrl}/api/ai/generate-website`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate website');
      }

      const data = await response.json();

      if (data.success && data.data?.html) {
        setGeneratedHtml(data.data.html);
        setIframeKey((prev) => prev + 1);
        toast.success('Website generated successfully');
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyHtml = async () => {
    try {
      await navigator.clipboard.writeText(generatedHtml);
      toast.success('HTML copied to clipboard');
    } catch {
      toast.error('Failed to copy HTML');
    }
  };

  const handleDownloadHtml = () => {
    try {
      const blob = new Blob([generatedHtml], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `generated-website-${new Date().getTime()}.html`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('HTML downloaded');
    } catch {
      toast.error('Failed to download HTML');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Website Generator</h1>
        <p className="text-muted-foreground">Generate complete websites using AI from a text prompt</p>
      </div>

      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Website Description</CardTitle>
          <CardDescription>Describe the website you want to generate</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="prompt">Prompt</Label>
            <Textarea
              id="prompt"
              placeholder="E.g., 'A pet care shop landing page with booking form, pricing table, and contact section'"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-32 resize-none"
              disabled={isLoading}
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button
            onClick={handleGenerateWebsite}
            disabled={isLoading || !prompt.trim()}
            className="w-full"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              'Generate Website'
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Generated HTML Actions */}
      {generatedHtml && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Generated HTML</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button onClick={handleCopyHtml} variant="outline" size="sm" className="flex-1">
                <Copy className="h-4 w-4 mr-2" />
                Copy HTML
              </Button>
              <Button onClick={handleDownloadHtml} size="sm" className="flex-1">
                <Download className="h-4 w-4 mr-2" />
                Download HTML
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Preview Section */}
      {generatedHtml && (
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle className="text-base">Live Preview</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <iframe
              key={iframeKey}
              srcDoc={generatedHtml}
              className="h-96 w-full border-t"
              sandbox="allow-scripts allow-same-origin"
              title="Generated Website Preview"
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
