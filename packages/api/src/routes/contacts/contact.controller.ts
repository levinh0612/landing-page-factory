import type { Request, Response, NextFunction } from 'express';
import * as contactService from './contact.service.js';

export async function create(req: Request<{ slug: string }>, res: Response, next: NextFunction) {
  try {
    const contact = await contactService.create(req.params.slug, req.body);
    res.status(201).json({ success: true, data: contact, message: 'Tin nhắn đã được gửi! Chúng tôi sẽ phản hồi sớm nhất.' });
  } catch (err) {
    next(err);
  }
}

export async function list(req: Request<{ slug: string }>, res: Response, next: NextFunction) {
  try {
    const result = await contactService.list(req.params.slug, req.query as any);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}

export async function markRead(req: Request<{ slug: string; id: string }>, res: Response, next: NextFunction) {
  try {
    const contact = await contactService.markRead(req.params.slug, req.params.id);
    res.json({ success: true, data: contact });
  } catch (err) {
    next(err);
  }
}
