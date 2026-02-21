import { prisma } from '../../lib/prisma.js';
import { AppError } from '../../middleware/error.js';
import { sendContactNotification } from '../../services/email.service.js';

export interface CreateContactInput {
  name: string;
  email?: string;
  phone?: string;
  message: string;
}

export async function create(projectSlug: string, input: CreateContactInput) {
  const project = await prisma.project.findUnique({ where: { slug: projectSlug } });
  if (!project) throw new AppError(404, `Project '${projectSlug}' not found`);

  const contact = await prisma.contact.create({
    data: { projectId: project.id, ...input },
  });

  sendContactNotification({ projectName: project.name, ...input })
    .catch((err) => console.error('[contact] email error:', err));

  return contact;
}

export async function list(projectSlug: string, query: { status?: string; page?: string; limit?: string }) {
  const project = await prisma.project.findUnique({ where: { slug: projectSlug } });
  if (!project) throw new AppError(404, `Project '${projectSlug}' not found`);

  const page = Math.max(1, parseInt(query.page ?? '1'));
  const limit = Math.min(100, parseInt(query.limit ?? '20'));
  const skip = (page - 1) * limit;

  const where = {
    projectId: project.id,
    ...(query.status ? { status: query.status as any } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.contact.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
    prisma.contact.count({ where }),
  ]);

  return { data: items, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
}

export async function markRead(projectSlug: string, contactId: string) {
  const project = await prisma.project.findUnique({ where: { slug: projectSlug } });
  if (!project) throw new AppError(404, `Project '${projectSlug}' not found`);

  const contact = await prisma.contact.findFirst({ where: { id: contactId, projectId: project.id } });
  if (!contact) throw new AppError(404, 'Contact not found');

  return prisma.contact.update({ where: { id: contactId }, data: { status: 'READ' } });
}
