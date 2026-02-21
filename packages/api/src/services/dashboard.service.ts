import { prisma } from '../lib/prisma.js';

export async function getStats() {
  const [totalTemplates, totalClients, totalProjects, activeProjects, recentActivity] =
    await Promise.all([
      prisma.template.count(),
      prisma.client.count(),
      prisma.project.count(),
      prisma.project.count({ where: { status: { in: ['IN_PROGRESS', 'READY', 'DEPLOYED'] } } }),
      prisma.activityLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          user: { select: { id: true, name: true } },
          project: { select: { id: true, name: true } },
        },
      }),
    ]);

  return { totalTemplates, totalClients, totalProjects, activeProjects, recentActivity };
}
