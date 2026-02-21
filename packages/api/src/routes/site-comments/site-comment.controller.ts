import type { Request, Response, NextFunction } from 'express';
import { prisma } from '../../lib/prisma.js';
import { AppError } from '../../middleware/error.js';

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const status = req.query.status ? String(req.query.status) : undefined;
    const postId = req.query.postId ? String(req.query.postId) : undefined;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (postId) where.postId = postId;

    const [data, total] = await Promise.all([
      prisma.siteComment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          post: { select: { title: true, slug: true } },
          page: { select: { title: true, slug: true } },
        },
      }),
      prisma.siteComment.count({ where }),
    ]);

    res.json({ success: true, data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } });
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request<{ id: string }>, res: Response, next: NextFunction) {
  try {
    const comment = await prisma.siteComment.findUnique({ where: { id: req.params.id } });
    if (!comment) throw new AppError(404, 'Comment not found');
    const updated = await prisma.siteComment.update({
      where: { id: req.params.id },
      data: { status: req.body.status },
    });
    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
}

export async function remove(req: Request<{ id: string }>, res: Response, next: NextFunction) {
  try {
    const comment = await prisma.siteComment.findUnique({ where: { id: req.params.id } });
    if (!comment) throw new AppError(404, 'Comment not found');
    await prisma.siteComment.delete({ where: { id: req.params.id } });
    res.json({ success: true, data: { message: 'Deleted' } });
  } catch (err) {
    next(err);
  }
}
