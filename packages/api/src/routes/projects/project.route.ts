import { Router } from 'express';
import {
  createProjectSchema,
  updateProjectSchema,
  updateProjectStatusSchema,
  createPreviewTokenSchema,
  createCommentSchema,
  updateApprovalSchema,
  paginationSchema,
} from '@lpf/shared';
import { validate } from '../../middleware/validate.js';
import { authenticate } from '../../middleware/auth.js';
import { authorize } from '../../middleware/authorize.js';
import * as projectController from './project.controller.js';

export const projectRoutes = Router();

// Preview is public (for iframe embedding)
projectRoutes.get('/:id/preview', projectController.preview);

// Protected routes
projectRoutes.use(authenticate);

projectRoutes.get('/', validate(paginationSchema, 'query'), projectController.list);
projectRoutes.get('/:id', projectController.getById);

// Write operations require ADMIN or EDITOR
projectRoutes.post('/', authorize('ADMIN', 'EDITOR'), validate(createProjectSchema), projectController.create);
projectRoutes.patch('/:id', authorize('ADMIN', 'EDITOR'), validate(updateProjectSchema), projectController.update);
projectRoutes.patch('/:id/status', authorize('ADMIN', 'EDITOR'), validate(updateProjectStatusSchema), projectController.updateStatus);
projectRoutes.delete('/:id', authorize('ADMIN', 'EDITOR'), projectController.remove);

// Preview tokens
projectRoutes.post('/:id/preview-token', authorize('ADMIN', 'EDITOR'), validate(createPreviewTokenSchema), projectController.generatePreviewToken);
projectRoutes.get('/:id/preview-tokens', projectController.listPreviewTokens);
projectRoutes.delete('/:id/preview-tokens/:tokenId', authorize('ADMIN', 'EDITOR'), projectController.revokePreviewToken);

// Comments
projectRoutes.get('/:id/comments', projectController.listComments);
projectRoutes.post('/:id/comments', authorize('ADMIN', 'EDITOR'), validate(createCommentSchema), projectController.addComment);

// Approval
projectRoutes.patch('/:id/approval', authorize('ADMIN', 'EDITOR'), validate(updateApprovalSchema), projectController.updateApproval);

// Deployments
projectRoutes.post('/:id/deploy', authorize('ADMIN', 'EDITOR'), projectController.deploy);
projectRoutes.get('/:id/deployments', projectController.listDeployments);

// Vercel domain management
projectRoutes.get('/:id/vercel-domains', projectController.listVercelDomains);
projectRoutes.post('/:id/vercel-domains', authorize('ADMIN', 'EDITOR'), projectController.addVercelDomain);
projectRoutes.delete('/:id/vercel-domains/:domain', authorize('ADMIN', 'EDITOR'), projectController.removeVercelDomain);
