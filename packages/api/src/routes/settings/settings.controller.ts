import type { Request, Response, NextFunction } from 'express';
import * as settingsService from '../../services/settings.service.js';

export async function getAll(req: Request, res: Response, next: NextFunction) {
  try {
    const section = req.query.section ? String(req.query.section) : undefined;
    const data = await settingsService.getAll(section);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function bulkUpdate(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await settingsService.bulkUpdate(req.body.settings);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}
