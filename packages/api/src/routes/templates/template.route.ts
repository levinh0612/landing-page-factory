import { Router } from 'express';
import { createTemplateSchema, updateTemplateSchema, paginationSchema } from '@lpf/shared';
import { validate } from '../../middleware/validate.js';
import { authenticate } from '../../middleware/auth.js';
import * as templateController from './template.controller.js';

export const templateRoutes = Router();

templateRoutes.use(authenticate);

templateRoutes.get('/', validate(paginationSchema, 'query'), templateController.list);
templateRoutes.get('/:id', templateController.getById);
templateRoutes.post('/', validate(createTemplateSchema), templateController.create);
templateRoutes.patch('/:id', validate(updateTemplateSchema), templateController.update);
templateRoutes.delete('/:id', templateController.remove);
