import fs from 'node:fs';
import path from 'node:path';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../middleware/error.js';
import { localStorage } from './local-storage.js';
import * as activityLog from './activity-log.service.js';
import type { CloneTemplateInput } from '@lpf/shared';

export async function clone(sourceId: string, input: CloneTemplateInput, userId?: string) {
  const source = await prisma.template.findUnique({ where: { id: sourceId } });
  if (!source) throw new AppError(404, 'Source template not found');

  const existing = await prisma.template.findUnique({ where: { slug: input.slug } });
  if (existing) throw new AppError(409, 'Template slug already exists');

  // Create new template with same metadata
  const newTemplate = await prisma.template.create({
    data: {
      name: input.name,
      slug: input.slug,
      category: source.category,
      description: source.description,
      techStack: source.techStack,
      plugins: source.plugins,
      configSchema: source.configSchema ?? undefined,
      status: 'DRAFT',
    },
  });

  // Copy files if source has uploaded files
  if (source.filePath && source.version > 0) {
    const sourceDir = localStorage.getAbsolutePath(source.filePath);
    const __dirname = path.dirname(new URL(import.meta.url).pathname);
    const BASE_DIR = path.resolve(__dirname, '../../uploads/templates');
    const destDir = path.join(BASE_DIR, newTemplate.id, 'v1');

    if (fs.existsSync(sourceDir)) {
      fs.cpSync(sourceDir, destDir, { recursive: true });

      const files = localStorage.listFiles(newTemplate.id, 1);
      const filePath = `templates/${newTemplate.id}/v1`;

      await prisma.template.update({
        where: { id: newTemplate.id },
        data: {
          version: 1,
          filePath,
          thumbnailUrl: source.thumbnailUrl
            ? `/api/templates/${newTemplate.id}/assets/preview.png`
            : null,
        },
      });

      // Record version
      await prisma.templateVersion.create({
        data: {
          templateId: newTemplate.id,
          version: 1,
          filePath,
          fileCount: files.length,
          fileSize: 0,
          uploadedBy: userId,
        },
      });
    }
  }

  if (userId) {
    await activityLog.log({
      userId,
      action: 'template.cloned',
      entityType: 'template',
      entityId: newTemplate.id,
      details: `Cloned from ${source.name} to ${newTemplate.name}`,
    });
  }

  return prisma.template.findUnique({
    where: { id: newTemplate.id },
    include: { _count: { select: { projects: true } } },
  });
}

export default { clone };
