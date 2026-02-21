import fs from 'node:fs';
import path from 'node:path';
import Handlebars from 'handlebars';
import type { TemplateConfigSchema } from '@lpf/shared';

// Register custom helpers
Handlebars.registerHelper('eq', (a: unknown, b: unknown) => a === b);

export class TemplateRenderer {
  /**
   * Render a template's index.html with the given config values.
   * Asset paths are rewritten to be served via the API.
   */
  render(
    templateDir: string,
    config: Record<string, unknown>,
    assetBaseUrl?: string,
  ): string {
    const indexPath = path.join(templateDir, 'index.html');
    if (!fs.existsSync(indexPath)) {
      throw new Error('Template index.html not found');
    }

    let html = fs.readFileSync(indexPath, 'utf-8');

    // Rewrite relative asset paths if assetBaseUrl provided
    if (assetBaseUrl) {
      html = html.replace(
        /(href|src)=["']\.\/(.*?)["']/g,
        (_match, attr, assetPath) => `${attr}="${assetBaseUrl}/${assetPath}"`,
      );
    }

    const template = Handlebars.compile(html, { noEscape: false });
    return template({ config });
  }

  /** Extract default values from a configSchema */
  getDefaultConfig(configSchema: TemplateConfigSchema): Record<string, unknown> {
    const defaults: Record<string, unknown> = {};
    for (const field of configSchema.fields) {
      defaults[field.key] = field.default;
    }
    return defaults;
  }
}

export const templateRenderer = new TemplateRenderer();
