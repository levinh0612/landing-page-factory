import type { Request, Response, NextFunction } from 'express';
import * as userService from '../../services/user.service.js';
import * as activityLog from '../../services/activity-log.service.js';

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await userService.list(req.query as any);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}

export async function getById(req: Request<{ id: string }>, res: Response, next: NextFunction) {
  try {
    const user = await userService.getById(req.params.id);
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await userService.create(req.body);
    await activityLog.log({
      userId: req.user!.userId,
      action: 'user.created',
      entityType: 'user',
      entityId: user.id,
      details: `Created user ${user.email}`,
    });
    res.status(201).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request<{ id: string }>, res: Response, next: NextFunction) {
  try {
    const user = await userService.update(req.params.id, req.body);
    await activityLog.log({
      userId: req.user!.userId,
      action: 'user.updated',
      entityType: 'user',
      entityId: user.id,
      details: `Updated user ${user.email}`,
    });
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
}

export async function remove(req: Request<{ id: string }>, res: Response, next: NextFunction) {
  try {
    const user = await userService.remove(req.params.id);
    await activityLog.log({
      userId: req.user!.userId,
      action: 'user.deactivated',
      entityType: 'user',
      entityId: user.id,
      details: `Deactivated user ${user.email}`,
    });
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
}
