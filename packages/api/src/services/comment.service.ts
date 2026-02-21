import { prisma } from '../lib/prisma.js';
import { AppError } from '../middleware/error.js';

export async function listByProject(projectId: string) {
  return prisma.comment.findMany({
    where: { projectId },
    orderBy: { createdAt: 'asc' },
    include: {
      user: { select: { name: true } },
    },
  });
}

export async function create(params: {
  projectId: string;
  userId?: string;
  authorName: string;
  content: string;
  isClient: boolean;
}) {
  // Verify project exists
  const project = await prisma.project.findUnique({ where: { id: params.projectId } });
  if (!project) throw new AppError(404, 'Project not found');

  return prisma.comment.create({
    data: {
      projectId: params.projectId,
      userId: params.userId,
      authorName: params.authorName,
      content: params.content,
      isClient: params.isClient,
    },
    include: {
      user: { select: { name: true } },
    },
  });
}

export async function remove(id: string) {
  const comment = await prisma.comment.findUnique({ where: { id } });
  if (!comment) throw new AppError(404, 'Comment not found');
  await prisma.comment.delete({ where: { id } });
}
