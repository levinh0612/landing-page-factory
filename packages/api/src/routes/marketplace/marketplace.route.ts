import { Router } from 'express';
import { authenticate } from '../../middleware/auth.js';
import * as controller from './marketplace.controller.js';

export const marketplaceRoutes = Router();
marketplaceRoutes.use(authenticate);

marketplaceRoutes.get('/curated', controller.listCurated);
marketplaceRoutes.get('/github-search', controller.githubSearch);
marketplaceRoutes.post('/import-url', controller.importUrl);
marketplaceRoutes.post('/clone/:id', controller.cloneTemplate);
