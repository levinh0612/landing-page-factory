import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../middleware/error.js';
import type {
  CreateProjectInput,
  UpdateProjectInput,
  UpdateProjectStatusInput,
  PaginationInput,
} from '@lpf/shared';

function toJsonValue(val: Record<string, unknown> | null | undefined) {
  if (val === null) return Prisma.JsonNull;
  if (val === undefined) return undefined;
  return val as Prisma.InputJsonValue;
}

export async function list(query: PaginationInput & { status?: string }) {
  const { page, limit, search, sortBy, sortOrder, status } = query;
  const skip = (page - 1) * limit;

  const where: any = {};

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { slug: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (status) {
    where.status = status;
  }

  const [data, total] = await Promise.all([
    prisma.project.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        client: { select: { id: true, name: true, company: true } },
        template: { select: { id: true, name: true, category: true } },
      },
    }),
    prisma.project.count({ where }),
  ]);

  return {
    data,
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
}

export async function getById(id: string) {
  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      client: true,
      template: true,
      deployments: { orderBy: { createdAt: 'desc' }, take: 5 },
      healthChecks: { orderBy: { checkedAt: 'desc' }, take: 1 },
    },
  });
  if (!project) throw new AppError(404, 'Project not found');
  return project;
}

export async function create(input: CreateProjectInput) {
  // Verify client and template exist
  const [client, template] = await Promise.all([
    prisma.client.findUnique({ where: { id: input.clientId } }),
    prisma.template.findUnique({ where: { id: input.templateId } }),
  ]);
  if (!client) throw new AppError(404, 'Client not found');
  if (!template) throw new AppError(404, 'Template not found');

  const existing = await prisma.project.findUnique({ where: { slug: input.slug } });
  if (existing) throw new AppError(409, 'Project slug already exists');

  const { config, ...rest } = input;
  return prisma.project.create({
    data: { ...rest, config: toJsonValue(config) },
    include: {
      client: { select: { id: true, name: true } },
      template: { select: { id: true, name: true } },
    },
  });
}

export async function update(id: string, input: UpdateProjectInput) {
  await getById(id);

  if (input.slug) {
    const existing = await prisma.project.findFirst({
      where: { slug: input.slug, NOT: { id } },
    });
    if (existing) throw new AppError(409, 'Project slug already exists');
  }

  const { config, clientId, templateId, ...rest } = input;
  return prisma.project.update({
    where: { id },
    data: {
      ...rest,
      ...(clientId !== undefined && { client: { connect: { id: clientId } } }),
      ...(templateId !== undefined && { template: { connect: { id: templateId } } }),
      config: toJsonValue(config),
    },
    include: {
      client: { select: { id: true, name: true } },
      template: { select: { id: true, name: true } },
    },
  });
}

export async function updateStatus(id: string, input: UpdateProjectStatusInput) {
  await getById(id);
  return prisma.project.update({
    where: { id },
    data: { status: input.status },
  });
}

export async function remove(id: string) {
  const project = await getById(id);

  // Delete related records first
  await prisma.$transaction([
    prisma.activityLog.deleteMany({ where: { projectId: id } }),
    prisma.healthCheck.deleteMany({ where: { projectId: id } }),
    prisma.deployment.deleteMany({ where: { projectId: id } }),
    prisma.project.delete({ where: { id } }),
  ]);

  return project;
}
