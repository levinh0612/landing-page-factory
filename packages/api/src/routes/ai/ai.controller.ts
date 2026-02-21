import type { Request, Response, NextFunction } from 'express';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function generateWebsite(req: Request, res: Response, next: NextFunction) {
  try {
    const { prompt } = req.body as { prompt: string };
    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return res.status(400).json({ success: false, error: 'Prompt is required' });
    }

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 8192,
      messages: [
        {
          role: 'user',
          content: `You are an expert web developer. Generate a complete, beautiful, single-file HTML website based on this description: "${prompt.trim()}".

Requirements:
- Complete HTML5 document (DOCTYPE, head, body)
- Embedded CSS in <style> tag (no external CSS frameworks)
- Embedded JavaScript in <script> tag if needed
- Responsive design (mobile-friendly)
- Modern, professional design with gradients and animations
- Vietnamese language if the description is in Vietnamese
- NO external image URLs (use CSS gradients or emoji instead)
- NO CDN links for CSS frameworks

Return ONLY the HTML code, no explanation, no markdown code blocks.`,
        },
      ],
    });

    const html = message.content[0].type === 'text' ? message.content[0].text : '';
    // Strip markdown code blocks if present
    const cleanHtml = html.replace(/^```html\n?/, '').replace(/\n?```$/, '').trim();

    res.json({ success: true, data: { html: cleanHtml } });
  } catch (err) {
    next(err);
  }
}
