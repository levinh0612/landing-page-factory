import crypto from 'node:crypto';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../middleware/error.js';

export async function generate(
  projectId: string,
  createdBy: string,
  expiresInDays: number = 7,
) {
  // Verify project exists
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) throw new AppError(404, 'Project not found');

  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + expiresInDays);

  return prisma.previewToken.create({
    data: {
      projectId,
      token,
      expiresAt,
      createdBy,
    },
  });
}

export async function validate(token: string) {
  const record = await prisma.previewToken.findUnique({
    where: { token },
    include: {
      project: {
        include: {
          template: true,
          client: { select: { name: true, company: true } },
        },
      },
    },
  });

  if (!record) throw new AppError(404, 'Invalid preview token');
  if (new Date() > record.expiresAt) throw new AppError(410, 'Preview token has expired');

  return { project: record.project, token: record };
}

export async function revoke(id: string) {
  const record = await prisma.previewToken.findUnique({ where: { id } });
  if (!record) throw new AppError(404, 'Preview token not found');

  await prisma.previewToken.delete({ where: { id } });
}

export async function listByProject(projectId: string) {
  return prisma.previewToken.findMany({
    where: { projectId },
    orderBy: { createdAt: 'desc' },
  });
}
