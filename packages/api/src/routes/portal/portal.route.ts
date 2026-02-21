import { Router } from 'express';
import { createCommentSchema } from '@lpf/shared';
import { validate } from '../../middleware/validate.js';
import * as portalController from './portal.controller.js';

export const portalRoutes = Router();

// All portal routes are PUBLIC (no auth required)
portalRoutes.get('/:token', portalController.getPortal);
portalRoutes.get('/:token/preview', portalController.previewProject);
portalRoutes.get('/:token/comments', portalController.listComments);
portalRoutes.post('/:token/comments', validate(createCommentSchema), portalController.addComment);
portalRoutes.post('/:token/approve', portalController.approve);
portalRoutes.post('/:token/request-changes', portalController.requestChanges);
