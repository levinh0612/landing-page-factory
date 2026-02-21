import { prisma } from '../lib/prisma.js';
import { AppError } from '../middleware/error.js';

export async function list(query: { page: number; limit: number; search?: string; status?: string }) {
  const { page, limit, search, status } = query;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (search) where.title = { contains: search, mode: 'insensitive' };

  const [data, total] = await Promise.all([
    prisma.post.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        categories: { include: { category: true } },
        tags: { include: { tag: true } },
        featuredImage: true,
      },
    }),
    prisma.post.count({ where }),
  ]);

  return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
}

export async function getById(id: string) {
  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      categories: { include: { category: true } },
      tags: { include: { tag: true } },
      featuredImage: true,
    },
  });
  if (!post) throw new AppError(404, 'Post not found');
  return post;
}

export async function create(input: {
  title: string;
  slug: string;
  content?: string;
  excerpt?: string;
  status?: string;
  authorId?: string;
  publishedAt?: string;
  featuredImageId?: string;
  categoryIds?: string[];
  tagIds?: string[];
}) {
  const { categoryIds = [], tagIds = [], ...data } = input;
  const post = await prisma.post.create({
    data: {
      ...data,
      status: (data.status as any) ?? 'DRAFT',
      publishedAt: data.publishedAt ? new Date(data.publishedAt) : null,
      categories: {
        create: categoryIds.map((id) => ({ categoryId: id })),
      },
      tags: {
        create: tagIds.map((id) => ({ tagId: id })),
      },
    },
    include: { categories: { include: { category: true } }, tags: { include: { tag: true } }, featuredImage: true },
  });
  return post;
}

export async function update(
  id: string,
  input: {
    title?: string;
    slug?: string;
    content?: string;
    excerpt?: string;
    status?: string;
    publishedAt?: string | null;
    featuredImageId?: string | null;
    categoryIds?: string[];
    tagIds?: string[];
  },
) {
  const { categoryIds, tagIds, ...data } = input;

  const updateData: Record<string, unknown> = { ...data };
  if (data.publishedAt !== undefined) {
    updateData.publishedAt = data.publishedAt ? new Date(data.publishedAt) : null;
  }

  if (categoryIds !== undefined) {
    await prisma.postsOnCategories.deleteMany({ where: { postId: id } });
  }
  if (tagIds !== undefined) {
    await prisma.postsOnTags.deleteMany({ where: { postId: id } });
  }

  const post = await prisma.post.update({
    where: { id },
    data: {
      ...updateData,
      ...(categoryIds ? { categories: { create: categoryIds.map((cid) => ({ categoryId: cid })) } } : {}),
      ...(tagIds ? { tags: { create: tagIds.map((tid) => ({ tagId: tid })) } } : {}),
    },
    include: { categories: { include: { category: true } }, tags: { include: { tag: true } }, featuredImage: true },
  });
  return post;
}

export async function remove(id: string) {
  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) throw new AppError(404, 'Post not found');
  await prisma.post.delete({ where: { id } });
}

// Categories
export async function listCategories() {
  return prisma.postCategory.findMany({ orderBy: { name: 'asc' } });
}

export async function createCategory(input: { name: string; slug: string; description?: string }) {
  return prisma.postCategory.create({ data: input });
}

// Tags
export async function listTags() {
  return prisma.postTag.findMany({ orderBy: { name: 'asc' } });
}

export async function createTag(input: { name: string; slug: string }) {
  return prisma.postTag.create({ data: input });
}
