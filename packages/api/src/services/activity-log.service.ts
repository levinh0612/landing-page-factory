import { prisma } from '../lib/prisma.js';
import type { ActivityLogQueryInput } from '@lpf/shared';

export async function log(params: {
  userId: string;
  action: string;
  entityType?: string;
  entityId?: string;
  projectId?: string;
  details?: string;
}): Promise<void> {
  await prisma.activityLog.create({
    data: {
      userId: params.userId,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      projectId: params.projectId,
      details: params.details,
    },
  });
}

export async function list(query: ActivityLogQueryInput) {
  const { page, limit, userId, action, entityType, dateFrom, dateTo } = query;
  const skip = (page - 1) * limit;

  const where: any = {};
  if (userId) where.userId = userId;
  if (action) where.action = { contains: action, mode: 'insensitive' };
  if (entityType) where.entityType = entityType;
  if (dateFrom || dateTo) {
    where.createdAt = {};
    if (dateFrom) where.createdAt.gte = new Date(dateFrom);
    if (dateTo) where.createdAt.lte = new Date(dateTo);
  }

  const [data, total] = await Promise.all([
    prisma.activityLog.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } },
        project: { select: { name: true } },
      },
    }),
    prisma.activityLog.count({ where }),
  ]);

  return {
    data,
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
}
