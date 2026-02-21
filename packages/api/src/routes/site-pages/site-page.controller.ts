import type { Request, Response, NextFunction } from 'express';
import * as sitePageService from '../../services/site-page.service.js';

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const search = req.query.search ? String(req.query.search) : undefined;
    const status = req.query.status ? String(req.query.status) : undefined;
    const result = await sitePageService.list({ page, limit, search, status });
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}

export async function getById(req: Request<{ id: string }>, res: Response, next: NextFunction) {
  try {
    const page = await sitePageService.getById(req.params.id);
    res.json({ success: true, data: page });
  } catch (err) {
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const page = await sitePageService.create(req.body);
    res.status(201).json({ success: true, data: page });
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request<{ id: string }>, res: Response, next: NextFunction) {
  try {
    const page = await sitePageService.update(req.params.id, req.body);
    res.json({ success: true, data: page });
  } catch (err) {
    next(err);
  }
}

export async function remove(req: Request<{ id: string }>, res: Response, next: NextFunction) {
  try {
    await sitePageService.remove(req.params.id);
    res.json({ success: true, data: { message: 'Deleted' } });
  } catch (err) {
    next(err);
  }
}
