import type { Request, Response, NextFunction } from 'express';
import * as projectService from '../../services/project.service.js';

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await projectService.list(req.query as any);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}

export async function getById(req: Request<{ id: string }>, res: Response, next: NextFunction) {
  try {
    const project = await projectService.getById(req.params.id);
    res.json({ success: true, data: project });
  } catch (err) {
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const project = await projectService.create(req.body);
    res.status(201).json({ success: true, data: project });
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request<{ id: string }>, res: Response, next: NextFunction) {
  try {
    const project = await projectService.update(req.params.id, req.body);
    res.json({ success: true, data: project });
  } catch (err) {
    next(err);
  }
}

export async function updateStatus(req: Request<{ id: string }>, res: Response, next: NextFunction) {
  try {
    const project = await projectService.updateStatus(req.params.id, req.body);
    res.json({ success: true, data: project });
  } catch (err) {
    next(err);
  }
}

export async function remove(req: Request<{ id: string }>, res: Response, next: NextFunction) {
  try {
    await projectService.remove(req.params.id);
    res.json({ success: true, data: { message: 'Project deleted' } });
  } catch (err) {
    next(err);
  }
}
