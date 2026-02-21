import type { Request, Response, NextFunction } from 'express';
import * as templateService from '../../services/template.service.js';

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await templateService.list(req.query as any);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}

export async function getById(req: Request<{ id: string }>, res: Response, next: NextFunction) {
  try {
    const template = await templateService.getById(req.params.id);
    res.json({ success: true, data: template });
  } catch (err) {
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const template = await templateService.create(req.body);
    res.status(201).json({ success: true, data: template });
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request<{ id: string }>, res: Response, next: NextFunction) {
  try {
    const template = await templateService.update(req.params.id, req.body);
    res.json({ success: true, data: template });
  } catch (err) {
    next(err);
  }
}

export async function remove(req: Request<{ id: string }>, res: Response, next: NextFunction) {
  try {
    await templateService.remove(req.params.id);
    res.json({ success: true, data: { message: 'Template deleted' } });
  } catch (err) {
    next(err);
  }
}
