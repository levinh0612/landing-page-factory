import { Router } from 'express';
import { authenticate } from '../../middleware/auth.js';
import * as ctrl from './contact.controller.js';

const router = Router({ mergeParams: true });

router.post('/', ctrl.create);
router.get('/', authenticate, ctrl.list);
router.patch('/:id/read', authenticate, ctrl.markRead);

export { router as contactRoutes };
