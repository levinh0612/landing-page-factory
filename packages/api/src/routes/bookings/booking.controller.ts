import type { Request, Response, NextFunction } from 'express';
import * as bookingService from './booking.service.js';

export async function create(req: Request<{ slug: string }>, res: Response, next: NextFunction) {
  try {
    const booking = await bookingService.create(req.params.slug, req.body);
    res.status(201).json({ success: true, data: booking, message: 'Đặt lịch thành công! Chúng tôi sẽ liên hệ xác nhận sớm nhất.' });
  } catch (err) {
    next(err);
  }
}

export async function list(req: Request<{ slug: string }>, res: Response, next: NextFunction) {
  try {
    const result = await bookingService.list(req.params.slug, req.query as any);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}

export async function updateStatus(req: Request<{ slug: string; id: string }>, res: Response, next: NextFunction) {
  try {
    const booking = await bookingService.updateStatus(req.params.slug, req.params.id, req.body.status);
    res.json({ success: true, data: booking });
  } catch (err) {
    next(err);
  }
}
