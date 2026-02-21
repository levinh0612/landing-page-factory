import type { Request, Response, NextFunction } from 'express';
import * as activityLogService from '../../services/activity-log.service.js';

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await activityLogService.list(req.query as any);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}
