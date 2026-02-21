import { Router } from 'express';
import { authenticate } from '../../middleware/auth.js';
import * as controller from './site-comment.controller.js';

export const siteCommentRoutes = Router();
siteCommentRoutes.use(authenticate);

siteCommentRoutes.get('/', controller.list);
siteCommentRoutes.patch('/:id', controller.update);
siteCommentRoutes.delete('/:id', controller.remove);
