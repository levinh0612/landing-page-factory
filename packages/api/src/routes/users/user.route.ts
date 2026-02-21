import { Router } from 'express';
import { createUserSchema, updateUserSchema, paginationSchema } from '@lpf/shared';
import { validate } from '../../middleware/validate.js';
import { authenticate } from '../../middleware/auth.js';
import { authorize } from '../../middleware/authorize.js';
import * as userController from './user.controller.js';

export const userRoutes = Router();

userRoutes.use(authenticate);
userRoutes.use(authorize('ADMIN'));

userRoutes.get('/', validate(paginationSchema, 'query'), userController.list);
userRoutes.get('/:id', userController.getById);
userRoutes.post('/', validate(createUserSchema), userController.create);
userRoutes.patch('/:id', validate(updateUserSchema), userController.update);
userRoutes.delete('/:id', userController.remove);
