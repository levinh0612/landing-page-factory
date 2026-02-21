import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../middleware/error.js';
import { localStorage } from './local-storage.js';
import { templateConfigSchema } from '@lpf/shared';
import * as activityLog from './activity-log.service.js';
import type { CreateTemplateInput, UpdateTemplateInput, PaginationInput, TemplateConfigSchema } from '@lpf/shared';

function toJsonValue(val: Record<string, unknown> | null | undefined) {
  if (val === null) return Prisma.JsonNull;
  if (val === undefined) return undefined;
  return val as Prisma.InputJsonValue;
}

export async function list(query: PaginationInput) {
  const { page, limit, search, sortBy, sortOrder } = query;
  const skip = (page - 1) * limit;

  const where = search
    ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { category: { contains: search, mode: 'insensitive' as const } },
        ],
      }
    : {};

  const [data, total] = await Promise.all([
    prisma.template.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: { _count: { select: { projects: true } } },
    }),
    prisma.template.count({ where }),
  ]);

  return {
    data,
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
}

export async function getById(id: string) {
  const template = await prisma.template.findUnique({
    where: { id },
    include: { _count: { select: { projects: true } } },
  });
  if (!template) throw new AppError(404, 'Template not found');
  return template;
}

export async function create(input: CreateTemplateInput, userId?: string) {
  const existing = await prisma.template.findUnique({ where: { slug: input.slug } });
  if (existing) throw new AppError(409, 'Template slug already exists');

  const template = await prisma.template.create({
    data: { ...input, configSchema: toJsonValue(input.configSchema) },
  });

  if (userId) {
    await activityLog.log({
      userId,
      action: 'template.created',
      entityType: 'template',
      entityId: template.id,
      details: `Created template ${template.name}`,
    });
  }

  return template;
}

export async function update(id: string, input: UpdateTemplateInput, userId?: string) {
  await getById(id);

  if (input.slug) {
    const existing = await prisma.template.findFirst({
      where: { slug: input.slug, NOT: { id } },
    });
    if (existing) throw new AppError(409, 'Template slug already exists');
  }

  const template = await prisma.template.update({
    where: { id },
    data: { ...input, configSchema: toJsonValue(input.configSchema) },
  });

  if (userId) {
    await activityLog.log({
      userId,
      action: 'template.updated',
      entityType: 'template',
      entityId: template.id,
      details: `Updated template ${template.name}`,
    });
  }

  return template;
}

export async function upload(id: string, zipBuffer: Buffer, userId?: string) {
  const template = await getById(id);
  const newVersion = template.version + 1;

  // Extract ZIP to local storage
  const filePath = await localStorage.save(id, newVersion, zipBuffer);

  // Parse config.schema.json if present in the ZIP
  const parsedSchema = localStorage.parseConfigSchema(id, newVersion);
  let configSchema: Prisma.InputJsonValue | undefined;
  if (parsedSchema) {
    const result = templateConfigSchema.safeParse(parsedSchema);
    if (result.success) {
      configSchema = result.data as unknown as Prisma.InputJsonValue;
    }
  }

  // Check for preview.png thumbnail
  const files = localStorage.listFiles(id, newVersion);
  const hasThumbnail = files.includes('preview.png');
  const thumbnailUrl = hasThumbnail
    ? `/api/templates/${id}/assets/preview.png`
    : undefined;

  const updated = await prisma.template.update({
    where: { id },
    data: {
      version: newVersion,
      filePath,
      ...(configSchema !== undefined && { configSchema }),
      ...(thumbnailUrl && { thumbnailUrl }),
    },
    include: { _count: { select: { projects: true } } },
  });

  // Record version
  const fileCount = files.length;
  const fileSize = zipBuffer.length;
  await prisma.templateVersion.create({
    data: {
      templateId: id,
      version: newVersion,
      filePath,
      fileCount,
      fileSize,
      uploadedBy: userId,
    },
  });

  if (userId) {
    await activityLog.log({
      userId,
      action: 'template.uploaded',
      entityType: 'template',
      entityId: id,
      details: `Uploaded v${newVersion} for template ${template.name}`,
    });
  }

  return updated;
}

export async function getConfigSchema(id: string): Promise<TemplateConfigSchema | null> {
  const template = await getById(id);
  if (!template.configSchema) return null;
  const result = templateConfigSchema.safeParse(template.configSchema);
  return result.success ? result.data : null;
}

export async function remove(id: string, userId?: string) {
  const template = await prisma.template.findUnique({
    where: { id },
    include: { _count: { select: { projects: true } } },
  });
  if (!template) throw new AppError(404, 'Template not found');
  if (template._count.projects > 0) {
    throw new AppError(400, 'Cannot delete template with existing projects');
  }

  // Delete version records
  await prisma.templateVersion.deleteMany({ where: { templateId: id } });

  // Clean up files
  await localStorage.delete(id);

  const deleted = await prisma.template.delete({ where: { id } });

  if (userId) {
    await activityLog.log({
      userId,
      action: 'template.deleted',
      entityType: 'template',
      entityId: id,
      details: `Deleted template ${template.name}`,
    });
  }

  return deleted;
}

export async function exportZip(id: string): Promise<Buffer> {
  const template = await getById(id);
  if (!template.filePath) {
    throw new AppError(400, 'Template has no uploaded files');
  }

  const AdmZip = (await import('adm-zip')).default;
  const templateDir = localStorage.getAbsolutePath(template.filePath);
  const zip = new AdmZip();
  zip.addLocalFolder(templateDir);

  // Add config schema as JSON
  if (template.configSchema) {
    zip.addFile(
      'config.schema.json',
      Buffer.from(JSON.stringify(template.configSchema, null, 2)),
    );
  }

  return zip.toBuffer();
}

export async function importZip(
  zipBuffer: Buffer,
  input: { name: string; slug: string; category?: string },
  userId?: string,
) {
  const existing = await prisma.template.findUnique({ where: { slug: input.slug } });
  if (existing) throw new AppError(409, 'Template slug already exists');

  // Create template first
  const template = await prisma.template.create({
    data: {
      name: input.name,
      slug: input.slug,
      category: input.category || 'imported',
    },
  });

  // Upload the zip
  const result = await upload(template.id, zipBuffer, userId);
  return result;
}
