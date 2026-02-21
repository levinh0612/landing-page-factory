import { Router } from 'express';
import { authenticate } from '../../middleware/auth.js';
import * as controller from './monitor.controller.js';

export const monitorRoutes = Router();
monitorRoutes.use(authenticate);

monitorRoutes.get('/system', controller.systemInfo);
monitorRoutes.get('/projects', controller.projectsHealth);
monitorRoutes.post('/projects/:id/ping', controller.pingProject);
