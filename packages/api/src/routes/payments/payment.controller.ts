import type { Request, Response, NextFunction } from 'express';
import * as paymentService from './payment.service.js';

export async function initiate(req: Request<{ slug: string }>, res: Response, next: NextFunction) {
  try {
    const result = await paymentService.initiate(req.params.slug, req.body);
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function webhook(req: Request<{ slug: string }>, res: Response, next: NextFunction) {
  try {
    const result = await paymentService.handleWebhook(req.params.slug, req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function mockSuccess(req: Request<{ slug: string; id: string }>, res: Response, next: NextFunction) {
  try {
    await paymentService.mockSuccess(req.params.slug, req.params.id);
    res.send('<script>window.close(); window.opener?.location.reload();</script><p>✅ Thanh toán thành công (mock). Bạn có thể đóng tab này.</p>');
  } catch (err) {
    next(err);
  }
}

export async function list(req: Request<{ slug: string }>, res: Response, next: NextFunction) {
  try {
    const result = await paymentService.list(req.params.slug, req.query as any);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}
