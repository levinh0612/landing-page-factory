import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import AdmZip from 'adm-zip';
import type { StorageService } from './storage.js';
import type { TemplateConfigSchema } from '@lpf/shared';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE_DIR = path.resolve(__dirname, '../../uploads/templates');

const MAX_ZIP_SIZE = 50 * 1024 * 1024; // 50MB

export class LocalStorageService implements StorageService {
  constructor() {
    fs.mkdirSync(BASE_DIR, { recursive: true });
  }

  async save(templateId: string, version: number, zipBuffer: Buffer): Promise<string> {
    if (zipBuffer.length > MAX_ZIP_SIZE) {
      throw new Error('ZIP file exceeds 50MB limit');
    }

    const zip = new AdmZip(zipBuffer);
    const entries = zip.getEntries();

    // Validate: must contain index.html (at root or nested one level)
    const hasIndex = entries.some(
      (e) => e.entryName === 'index.html' || e.entryName.endsWith('/index.html'),
    );
    if (!hasIndex) {
      throw new Error('ZIP must contain an index.html file');
    }

    const destDir = path.join(BASE_DIR, templateId, `v${version}`);

    // Clean previous version directory if exists
    if (fs.existsSync(destDir)) {
      fs.rmSync(destDir, { recursive: true });
    }
    fs.mkdirSync(destDir, { recursive: true });

    // Safe extraction: validate each entry to prevent zip-slip attacks
    for (const entry of entries) {
      if (entry.isDirectory) continue;
      const normalized = path.normalize(entry.entryName);
      if (normalized.startsWith('..') || path.isAbsolute(normalized)) {
        throw new Error(`Malicious ZIP entry detected: ${entry.entryName}`);
      }
      const targetPath = path.join(destDir, normalized);
      if (!targetPath.startsWith(destDir)) {
        throw new Error(`Path traversal attempt: ${entry.entryName}`);
      }
      fs.mkdirSync(path.dirname(targetPath), { recursive: true });
      fs.writeFileSync(targetPath, entry.getData());
    }

    // If files were nested in a single top-level folder, flatten
    const extracted = fs.readdirSync(destDir);
    if (extracted.length === 1) {
      const single = path.join(destDir, extracted[0]);
      try {
        if (fs.statSync(single).isDirectory()) {
          for (const child of fs.readdirSync(single)) {
            fs.renameSync(path.join(single, child), path.join(destDir, child));
          }
          fs.rmdirSync(single);
        }
      } catch (err: any) {
        throw new Error(`Failed to flatten ZIP structure: ${err.message}`);
      }
    }

    // Validate index.html exists at root after extraction
    if (!fs.existsSync(path.join(destDir, 'index.html'))) {
      fs.rmSync(destDir, { recursive: true });
      throw new Error('index.html must be at the root of the ZIP archive');
    }

    return `templates/${templateId}/v${version}`;
  }

  getAbsolutePath(relativePath: string): string {
    return path.resolve(__dirname, '../../uploads', relativePath);
  }

  async delete(templateId: string): Promise<void> {
    const dir = path.join(BASE_DIR, templateId);
    if (fs.existsSync(dir)) {
      fs.rmSync(dir, { recursive: true });
    }
  }

  exists(templateId: string, version: number): boolean {
    const dir = path.join(BASE_DIR, templateId, `v${version}`);
    return fs.existsSync(dir);
  }

  listFiles(templateId: string, version: number): string[] {
    const dir = path.join(BASE_DIR, templateId, `v${version}`);
    if (!fs.existsSync(dir)) return [];
    return this.walkDir(dir, dir);
  }

  /** Parse config.schema.json from extracted template if it exists */
  parseConfigSchema(templateId: string, version: number): TemplateConfigSchema | null {
    const schemaPath = path.join(BASE_DIR, templateId, `v${version}`, 'config.schema.json');
    if (!fs.existsSync(schemaPath)) return null;
    try {
      const content = fs.readFileSync(schemaPath, 'utf-8');
      return JSON.parse(content) as TemplateConfigSchema;
    } catch {
      return null;
    }
  }

  private walkDir(dir: string, baseDir: string): string[] {
    const results: string[] = [];
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        results.push(...this.walkDir(fullPath, baseDir));
      } else {
        results.push(path.relative(baseDir, fullPath));
      }
    }
    return results;
  }
}

// Singleton instance
export const localStorage = new LocalStorageService();
