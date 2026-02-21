import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../middleware/error.js';
import { localStorage } from './local-storage.js';
import { templateRenderer } from './template-renderer.js';
import { templateConfigSchema } from '@lpf/shared';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BUILDS_DIR = path.resolve(__dirname, '../../uploads/builds');

export async function buildProject(projectId: string): Promise<string> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { template: true },
  });
  if (!project) throw new AppError(404, 'Project not found');
  if (!project.template.filePath) {
    throw new AppError(400, 'Template has no uploaded files');
  }

  const templateDir = localStorage.getAbsolutePath(project.template.filePath);
  const buildDir = path.join(BUILDS_DIR, projectId);

  // Clean previous build
  if (fs.existsSync(buildDir)) {
    fs.rmSync(buildDir, { recursive: true });
  }
  fs.mkdirSync(buildDir, { recursive: true });

  // Copy all template files to build dir
  fs.cpSync(templateDir, buildDir, { recursive: true });

  // Render index.html with project config
  let config: Record<string, unknown> = {};
  if (project.template.configSchema) {
    const result = templateConfigSchema.safeParse(project.template.configSchema);
    if (result.success) {
      config = templateRenderer.getDefaultConfig(result.data);
    }
  }
  if (project.config && typeof project.config === 'object') {
    config = { ...config, ...(project.config as Record<string, unknown>) };
  }

  // Render HTML without rewriting asset paths (they stay relative for deploy)
  const indexPath = path.join(buildDir, 'index.html');
  if (fs.existsSync(indexPath)) {
    const html = templateRenderer.render(buildDir, config);
    fs.writeFileSync(indexPath, html);
  }

  return buildDir;
}
