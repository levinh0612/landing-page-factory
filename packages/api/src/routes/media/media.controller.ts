import type { Request, Response, NextFunction } from 'express';
import * as mediaService from '../../services/media.service.js';

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 24;
    const type = req.query.type ? String(req.query.type) : undefined;
    const result = await mediaService.list({ page, limit, type });
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}

export async function upload(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }
    const mediaFile = await mediaService.create(req.file, req.user?.userId);
    res.status(201).json({ success: true, data: mediaFile });
  } catch (err) {
    next(err);
  }
}

export async function remove(req: Request<{ id: string }>, res: Response, next: NextFunction) {
  try {
    await mediaService.remove(req.params.id);
    res.json({ success: true, data: { message: 'Deleted' } });
  } catch (err) {
    next(err);
  }
}
