import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../middleware/error.js';
import type { CreateTemplateInput, UpdateTemplateInput, PaginationInput } from '@lpf/shared';

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

export async function create(input: CreateTemplateInput) {
  const existing = await prisma.template.findUnique({ where: { slug: input.slug } });
  if (existing) throw new AppError(409, 'Template slug already exists');

  return prisma.template.create({
    data: { ...input, configSchema: toJsonValue(input.configSchema) },
  });
}

export async function update(id: string, input: UpdateTemplateInput) {
  await getById(id);

  if (input.slug) {
    const existing = await prisma.template.findFirst({
      where: { slug: input.slug, NOT: { id } },
    });
    if (existing) throw new AppError(409, 'Template slug already exists');
  }

  return prisma.template.update({
    where: { id },
    data: { ...input, configSchema: toJsonValue(input.configSchema) },
  });
}

export async function remove(id: string) {
  const template = await prisma.template.findUnique({
    where: { id },
    include: { _count: { select: { projects: true } } },
  });
  if (!template) throw new AppError(404, 'Template not found');
  if (template._count.projects > 0) {
    throw new AppError(400, 'Cannot delete template with existing projects');
  }

  return prisma.template.delete({ where: { id } });
}
