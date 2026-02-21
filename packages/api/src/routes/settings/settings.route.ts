import { Router } from 'express';
import { authenticate } from '../../middleware/auth.js';
import * as controller from './settings.controller.js';

export const settingsRoutes = Router();
settingsRoutes.use(authenticate);

settingsRoutes.get('/', controller.getAll);
settingsRoutes.put('/', controller.bulkUpdate);
