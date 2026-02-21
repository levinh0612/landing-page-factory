import { Router } from 'express';
import { authenticate } from '../../middleware/auth.js';
import * as controller from './post.controller.js';

export const postRoutes = Router();
postRoutes.use(authenticate);

postRoutes.get('/', controller.list);
postRoutes.post('/', controller.create);
postRoutes.get('/categories', controller.listCategories);
postRoutes.post('/categories', controller.createCategory);
postRoutes.get('/tags', controller.listTags);
postRoutes.post('/tags', controller.createTag);
postRoutes.get('/:id', controller.getById);
postRoutes.patch('/:id', controller.update);
postRoutes.delete('/:id', controller.remove);
