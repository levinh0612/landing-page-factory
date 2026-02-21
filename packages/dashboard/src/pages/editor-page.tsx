import { useState, useCallback, useRef, useEffect } from 'react';
import { Copy, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const STARTER_TEMPLATES = {
  blank: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Blank Page</title>
  <style>
    body {
      font-family: system-ui, -apple-system, sans-serif;
      margin: 0;
      padding: 20px;
      background: #f9fafb;
    }
  </style>
</head>
<body>
  <h1>Welcome to your HTML editor</h1>
  <p>Edit the code on the left to see changes in real-time.</p>
</body>
</html>`,
  landing: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Landing Page</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: system-ui, -apple-system, sans-serif;
      line-height: 1.6;
    }
    .hero {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 100px 20px;
      text-align: center;
    }
    .hero h1 {
      font-size: 3rem;
      margin-bottom: 20px;
    }
    .hero p {
      font-size: 1.2rem;
      margin-bottom: 30px;
      opacity: 0.9;
    }
    .btn {
      display: inline-block;
      padding: 12px 30px;
      background: white;
      color: #667eea;
      text-decoration: none;
      border-radius: 5px;
      font-weight: bold;
      transition: transform 0.3s;
    }
    .btn:hover {
      transform: scale(1.05);
    }
    .features {
      padding: 80px 20px;
      max-width: 1000px;
      margin: 0 auto;
    }
    .feature-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 30px;
      margin-top: 40px;
    }
    .feature-card {
      padding: 30px;
      background: #f9fafb;
      border-radius: 10px;
      text-align: center;
    }
    .feature-card h3 {
      margin-bottom: 15px;
      color: #667eea;
    }
    h2 {
      text-align: center;
      font-size: 2.5rem;
      margin-bottom: 20px;
    }
  </style>
</head>
<body>
  <div class="hero">
    <h1>Your Amazing Product</h1>
    <p>Build something incredible today</p>
    <a href="#" class="btn">Get Started</a>
  </div>

  <div class="features">
    <h2>Features</h2>
    <div class="feature-grid">
      <div class="feature-card">
        <h3>Fast</h3>
        <p>Lightning-quick performance</p>
      </div>
      <div class="feature-card">
        <h3>Reliable</h3>
        <p>99.9% uptime guaranteed</p>
      </div>
      <div class="feature-card">
        <h3>Secure</h3>
        <p>Bank-level security</p>
      </div>
    </div>
  </div>
</body>
</html>`,
  petcare: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pet Care Shop</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: system-ui, -apple-system, sans-serif;
      line-height: 1.6;
    }
    header {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      color: white;
      padding: 20px;
      text-align: center;
    }
    nav {
      background: #333;
      padding: 10px;
      text-align: center;
    }
    nav a {
      color: white;
      text-decoration: none;
      padding: 10px 20px;
      display: inline-block;
    }
    nav a:hover {
      background: #555;
    }
    .hero {
      background: linear-gradient(to right, #ffecd2, #fcb69f);
      padding: 60px 20px;
      text-align: center;
    }
    .hero h1 {
      font-size: 2.5rem;
      margin-bottom: 15px;
    }
    .services {
      padding: 60px 20px;
      max-width: 1000px;
      margin: 0 auto;
    }
    .service-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-top: 30px;
    }
    .service-card {
      padding: 20px;
      border: 2px solid #f5576c;
      border-radius: 10px;
      text-align: center;
    }
    .service-card h3 {
      margin-bottom: 10px;
      color: #f5576c;;
    }
    .pricing {
      background: #f9fafb;
      padding: 60px 20px;
      text-align: center;
    }
    .pricing-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 20px;
      margin-top: 30px;
      max-width: 800px;
      margin-left: auto;
      margin-right: auto;
    }
    .price-card {
      padding: 20px;
      background: white;
      border-radius: 10px;
      border: 1px solid #ddd;
    }
    .price-card h4 {
      color: #f5576c;
      margin-bottom: 10px;
    }
    .price {
      font-size: 1.5rem;
      font-weight: bold;
      margin: 10px 0;
    }
  </style>
</head>
<body>
  <header>
    <h1>🐾 Pet Care Shop</h1>
    <p>Everything your furry friend needs</p>
  </header>

  <nav>
    <a href="#services">Services</a>
    <a href="#pricing">Pricing</a>
    <a href="#contact">Contact</a>
  </nav>

  <div class="hero">
    <h1>Love Your Pet</h1>
    <p>Premium care and products for all your pets</p>
  </div>

  <div class="services" id="services">
    <h2>Our Services</h2>
    <div class="service-grid">
      <div class="service-card">
        <h3>🛁 Grooming</h3>
        <p>Professional pet grooming</p>
      </div>
      <div class="service-card">
        <h3>🏥 Health Check</h3>
        <p>Veterinary care services</p>
      </div>
      <div class="service-card">
        <h3>🎾 Training</h3>
        <p>Obedience and tricks training</p>
      </div>
      <div class="service-card">
        <h3>🏨 Boarding</h3>
        <p>Safe and comfortable boarding</p>
      </div>
    </div>
  </div>

  <div class="pricing" id="pricing">
    <h2>Pricing</h2>
    <div class="pricing-grid">
      <div class="price-card">
        <h4>Basic</h4>
        <p>Grooming only</p>
        <div class="price">$29</div>
      </div>
      <div class="price-card">
        <h4>Standard</h4>
        <p>Grooming + Check</p>
        <div class="price">$59</div>
      </div>
      <div class="price-card">
        <h4>Premium</h4>
        <p>All services</p>
        <div class="price">$99</div>
      </div>
    </div>
  </div>

  <footer style="background: #333; color: white; padding: 20px; text-align: center;">
    <p>&copy; 2024 Pet Care Shop. All rights reserved.</p>
  </footer>
</body>
</html>`,
};

export function EditorPage() {
  const [html, setHtml] = useState(STARTER_TEMPLATES.blank);
  const [iframeKey, setIframeKey] = useState(0);
  const debounceTimerRef = useRef<NodeJS.Timeout>();
  const [selectedTemplate, setSelectedTemplate] = useState('blank');

  // Debounced iframe update
  const updateIframe = useCallback(() => {
    setIframeKey((prev) => prev + 1);
  }, []);

  useEffect(() => {
    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new timer
    debounceTimerRef.current = setTimeout(() => {
      updateIframe();
    }, 500);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [html, updateIframe]);

  const handleTemplateChange = (templateKey: string) => {
    setSelectedTemplate(templateKey);
    setHtml(STARTER_TEMPLATES[templateKey as keyof typeof STARTER_TEMPLATES] || STARTER_TEMPLATES.blank);
    setIframeKey((prev) => prev + 1);
  };

  const handleReset = () => {
    const template = STARTER_TEMPLATES[selectedTemplate as keyof typeof STARTER_TEMPLATES] || STARTER_TEMPLATES.blank;
    setHtml(template);
    setIframeKey((prev) => prev + 1);
  };

  const handleCopyHtml = async () => {
    try {
      await navigator.clipboard.writeText(html);
      toast.success('HTML copied to clipboard');
    } catch {
      toast.error('Failed to copy HTML');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Code Editor</h1>
        <p className="text-muted-foreground">Design and preview HTML/CSS/JS in real-time</p>
      </div>

      {/* Toolbar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Starter Template</label>
              <Select value={selectedTemplate} onValueChange={handleTemplateChange}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="blank">Blank HTML</SelectItem>
                  <SelectItem value="landing">Landing Page</SelectItem>
                  <SelectItem value="petcare">Pet Care</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={handleReset} size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset
              </Button>
              <Button onClick={handleCopyHtml} size="sm">
                <Copy className="h-4 w-4 mr-2" />
                Copy HTML
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Editor & Preview */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Code Editor Pane */}
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle className="text-base">HTML Code</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <textarea
              value={html}
              onChange={(e) => setHtml(e.target.value)}
              className="h-96 w-full border-t p-4 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              spellCheck="false"
            />
          </CardContent>
        </Card>

        {/* Preview Pane */}
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle className="text-base">Live Preview</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <iframe
              key={iframeKey}
              srcDoc={html}
              className="h-96 w-full border-t"
              sandbox="allow-scripts allow-same-origin"
              title="HTML Preview"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
