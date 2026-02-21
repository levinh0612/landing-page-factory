import { prisma } from '../lib/prisma.js';
import { AppError } from '../middleware/error.js';
import * as activityLog from './activity-log.service.js';
import * as previewTokenService from './preview-token.service.js';

export async function updateStatus(
  projectId: string,
  status: 'PENDING' | 'APPROVED' | 'CHANGES_REQUESTED',
  token?: string,
  userId?: string,
) {
  // If token provided, validate it matches the project
  if (token) {
    const validated = await previewTokenService.validate(token);
    if (validated.project.id !== projectId) {
      throw new AppError(403, 'Token does not match project');
    }
  }

  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) throw new AppError(404, 'Project not found');

  const updated = await prisma.project.update({
    where: { id: projectId },
    data: { approvalStatus: status },
  });

  if (userId) {
    await activityLog.log({
      userId,
      action: `project.approval_${status.toLowerCase()}`,
      entityType: 'project',
      entityId: projectId,
      projectId,
      details: `Approval status changed to ${status}`,
    });
  }

  return updated;
}
