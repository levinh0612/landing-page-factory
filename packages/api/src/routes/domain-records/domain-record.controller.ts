import type { Request, Response, NextFunction } from 'express';
import * as domainRecordService from '../../services/domain-record.service.js';

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await domainRecordService.list(req.query as any);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}

export async function getById(req: Request<{ id: string }>, res: Response, next: NextFunction) {
  try {
    const record = await domainRecordService.getById(req.params.id);
    res.json({ success: true, data: record });
  } catch (err) {
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const record = await domainRecordService.create(req.body, req.user?.userId);
    res.status(201).json({ success: true, data: record });
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request<{ id: string }>, res: Response, next: NextFunction) {
  try {
    const record = await domainRecordService.update(req.params.id, req.body, req.user?.userId);
    res.json({ success: true, data: record });
  } catch (err) {
    next(err);
  }
}

export async function remove(req: Request<{ id: string }>, res: Response, next: NextFunction) {
  try {
    await domainRecordService.remove(req.params.id, req.user?.userId);
    res.json({ success: true, data: { message: 'Domain record deleted' } });
  } catch (err) {
    next(err);
  }
}

export async function refreshWhois(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
) {
  try {
    const record = await domainRecordService.refreshWhois(req.params.id, req.user?.userId);
    res.json({ success: true, data: record });
  } catch (err) {
    next(err);
  }
}
