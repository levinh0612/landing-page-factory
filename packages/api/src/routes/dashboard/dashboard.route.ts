import { Router } from 'express';
import { authenticate } from '../../middleware/auth.js';
import * as dashboardService from '../../services/dashboard.service.js';
import type { Request, Response, NextFunction } from 'express';

export const dashboardRoutes = Router();

dashboardRoutes.use(authenticate);

dashboardRoutes.get('/stats', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = await dashboardService.getStats();
    res.json({ success: true, data: stats });
  } catch (err) {
    next(err);
  }
});
