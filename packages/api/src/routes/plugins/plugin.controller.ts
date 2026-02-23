import type { Request, Response, NextFunction } from 'express';
import { prisma } from '../../lib/prisma.js';

export async function listPlugins(_req: Request, res: Response, next: NextFunction) {
  try {
    const plugins = await prisma.plugin.findMany({ orderBy: { category: 'asc' } });
    res.json({ success: true, data: plugins });
  } catch (err) {
    next(err);
  }
}
