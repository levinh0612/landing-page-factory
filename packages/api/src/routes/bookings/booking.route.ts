import { Router } from 'express';
import { authenticate } from '../../middleware/auth.js';
import * as ctrl from './booking.controller.js';

const router = Router({ mergeParams: true }); // mergeParams to access :slug from parent

// Public — client submits booking form
router.post('/', ctrl.create);

// Protected — admin views / manages bookings
router.get('/', authenticate, ctrl.list);
router.patch('/:id/status', authenticate, ctrl.updateStatus);

export { router as bookingRoutes };
