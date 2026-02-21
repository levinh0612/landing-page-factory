import { Router } from 'express';
import { createClientSchema, updateClientSchema, paginationSchema } from '@lpf/shared';
import { validate } from '../../middleware/validate.js';
import { authenticate } from '../../middleware/auth.js';
import * as clientController from './client.controller.js';

export const clientRoutes = Router();

clientRoutes.use(authenticate);

clientRoutes.get('/', validate(paginationSchema, 'query'), clientController.list);
clientRoutes.get('/:id', clientController.getById);
clientRoutes.post('/', validate(createClientSchema), clientController.create);
clientRoutes.patch('/:id', validate(updateClientSchema), clientController.update);
clientRoutes.delete('/:id', clientController.remove);
