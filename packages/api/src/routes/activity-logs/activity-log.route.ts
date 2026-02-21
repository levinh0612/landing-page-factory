import { Router } from 'express';
import { activityLogQuerySchema } from '@lpf/shared';
import { validate } from '../../middleware/validate.js';
import { authenticate } from '../../middleware/auth.js';
import { authorize } from '../../middleware/authorize.js';
import * as activityLogController from './activity-log.controller.js';

export const activityLogRoutes = Router();

activityLogRoutes.use(authenticate);
activityLogRoutes.use(authorize('ADMIN', 'EDITOR'));

activityLogRoutes.get('/', validate(activityLogQuerySchema, 'query'), activityLogController.list);
