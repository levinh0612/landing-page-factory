import { Router } from 'express';
import {
  createProjectSchema,
  updateProjectSchema,
  updateProjectStatusSchema,
  paginationSchema,
} from '@lpf/shared';
import { validate } from '../../middleware/validate.js';
import { authenticate } from '../../middleware/auth.js';
import * as projectController from './project.controller.js';

export const projectRoutes = Router();

projectRoutes.use(authenticate);

projectRoutes.get('/', validate(paginationSchema, 'query'), projectController.list);
projectRoutes.get('/:id', projectController.getById);
projectRoutes.post('/', validate(createProjectSchema), projectController.create);
projectRoutes.patch('/:id', validate(updateProjectSchema), projectController.update);
projectRoutes.patch('/:id/status', validate(updateProjectStatusSchema), projectController.updateStatus);
projectRoutes.delete('/:id', projectController.remove);
