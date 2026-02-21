import { prisma } from '../lib/prisma.js';
import { AppError } from '../middleware/error.js';

export async function list(query: { page: number; limit: number; search?: string; status?: string }) {
  const { page, limit, search, status } = query;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (search) where.title = { contains: search, mode: 'insensitive' };

  const [data, total] = await Promise.all([
    prisma.sitePage.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
    prisma.sitePage.count({ where }),
  ]);

  return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
}

export async function getById(id: string) {
  const page = await prisma.sitePage.findUnique({ where: { id } });
  if (!page) throw new AppError(404, 'Page not found');
  return page;
}

export async function create(input: { title: string; slug: string; content?: string; status?: string }) {
  return prisma.sitePage.create({ data: { ...input, status: (input.status as any) ?? 'DRAFT' } });
}

export async function update(id: string, input: { title?: string; slug?: string; content?: string; status?: string }) {
  return prisma.sitePage.update({ where: { id }, data: input as any });
}

export async function remove(id: string) {
  const page = await prisma.sitePage.findUnique({ where: { id } });
  if (!page) throw new AppError(404, 'Page not found');
  await prisma.sitePage.delete({ where: { id } });
}
