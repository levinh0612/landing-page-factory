import { prisma } from '../lib/prisma.js';
import { AppError } from '../middleware/error.js';
import type { CreateClientInput, UpdateClientInput, PaginationInput } from '@lpf/shared';

export async function list(query: PaginationInput) {
  const { page, limit, search, sortBy, sortOrder } = query;
  const skip = (page - 1) * limit;

  const where = search
    ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { company: { contains: search, mode: 'insensitive' as const } },
          { email: { contains: search, mode: 'insensitive' as const } },
        ],
      }
    : {};

  const [data, total] = await Promise.all([
    prisma.client.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: { _count: { select: { projects: true } } },
    }),
    prisma.client.count({ where }),
  ]);

  return {
    data,
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
}

export async function getById(id: string) {
  const client = await prisma.client.findUnique({
    where: { id },
    include: { projects: true, _count: { select: { projects: true } } },
  });
  if (!client) throw new AppError(404, 'Client not found');
  return client;
}

export async function create(input: CreateClientInput) {
  return prisma.client.create({ data: input });
}

export async function update(id: string, input: UpdateClientInput) {
  await getById(id);
  return prisma.client.update({ where: { id }, data: input });
}

export async function remove(id: string) {
  const client = await prisma.client.findUnique({
    where: { id },
    include: { _count: { select: { projects: true } } },
  });
  if (!client) throw new AppError(404, 'Client not found');
  if (client._count.projects > 0) {
    throw new AppError(400, 'Cannot delete client with existing projects');
  }
  return prisma.client.delete({ where: { id } });
}
