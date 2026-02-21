import { Router } from 'express';
import { createClientSchema, updateClientSchema, paginationSchema } from '@lpf/shared';
import { validate } from '../../middleware/validate.js';
import { authenticate } from '../../middleware/auth.js';
import { authorize } from '../../middleware/authorize.js';
import * as clientController from './client.controller.js';

export const clientRoutes = Router();

clientRoutes.use(authenticate);

clientRoutes.get('/', validate(paginationSchema, 'query'), clientController.list);
clientRoutes.get('/:id', clientController.getById);

// Write operations require ADMIN or EDITOR
clientRoutes.post('/', authorize('ADMIN', 'EDITOR'), validate(createClientSchema), clientController.create);
clientRoutes.patch('/:id', authorize('ADMIN', 'EDITOR'), validate(updateClientSchema), clientController.update);
clientRoutes.delete('/:id', authorize('ADMIN', 'EDITOR'), clientController.remove);
