import { Router } from 'express';
import { authenticate } from '../../middleware/auth.js';
import * as ctrl from './payment.controller.js';

const router = Router({ mergeParams: true });

// Public
router.post('/initiate', ctrl.initiate);
router.post('/webhook', ctrl.webhook);
router.get('/:id/mock-success', ctrl.mockSuccess); // dev only

// Protected
router.get('/', authenticate, ctrl.list);

export { router as paymentRoutes };
