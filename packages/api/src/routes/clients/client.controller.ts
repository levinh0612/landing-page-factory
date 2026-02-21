import type { Request, Response, NextFunction } from 'express';
import * as clientService from '../../services/client.service.js';

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await clientService.list(req.query as any);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}

export async function getById(req: Request<{ id: string }>, res: Response, next: NextFunction) {
  try {
    const client = await clientService.getById(req.params.id);
    res.json({ success: true, data: client });
  } catch (err) {
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const client = await clientService.create(req.body, req.user?.userId);
    res.status(201).json({ success: true, data: client });
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request<{ id: string }>, res: Response, next: NextFunction) {
  try {
    const client = await clientService.update(req.params.id, req.body, req.user?.userId);
    res.json({ success: true, data: client });
  } catch (err) {
    next(err);
  }
}

export async function remove(req: Request<{ id: string }>, res: Response, next: NextFunction) {
  try {
    await clientService.remove(req.params.id, req.user?.userId);
    res.json({ success: true, data: { message: 'Client deleted' } });
  } catch (err) {
    next(err);
  }
}
