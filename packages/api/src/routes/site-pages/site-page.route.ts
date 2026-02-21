import { Router } from 'express';
import { authenticate } from '../../middleware/auth.js';
import * as controller from './site-page.controller.js';

export const sitePageRoutes = Router();
sitePageRoutes.use(authenticate);

sitePageRoutes.get('/', controller.list);
sitePageRoutes.post('/', controller.create);
sitePageRoutes.get('/:id', controller.getById);
sitePageRoutes.patch('/:id', controller.update);
sitePageRoutes.delete('/:id', controller.remove);
