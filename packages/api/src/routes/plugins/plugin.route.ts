import { Router } from 'express';
import { authenticate } from '../../middleware/auth.js';
import * as controller from './plugin.controller.js';

export const pluginRoutes = Router();
pluginRoutes.use(authenticate);

pluginRoutes.get('/', controller.listPlugins);
