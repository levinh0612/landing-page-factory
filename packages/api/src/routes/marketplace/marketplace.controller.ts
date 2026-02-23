import type { Request, Response, NextFunction } from 'express';
import { prisma } from '../../lib/prisma.js';
import * as service from './marketplace.service.js';

export async function listCurated(req: Request, res: Response, next: NextFunction) {
  try {
    const category = req.query.category ? String(req.query.category) : undefined;
    const templates = await service.getCuratedTemplates(category);
    res.json({ success: true, data: templates });
  } catch (err) {
    next(err);
  }
}

export async function githubSearch(req: Request, res: Response, next: NextFunction) {
  try {
    const q = req.query.q ? String(req.query.q) : 'landing page';

    // Optionally read GITHUB_TOKEN from Settings
    const setting = await prisma.setting.findUnique({ where: { key: 'github_token' } }).catch(() => null);
    const githubToken = setting?.value || undefined;

    const results = await service.searchGithub(q, githubToken);
    res.json({ success: true, data: results });
  } catch (err) {
    next(err);
  }
}

export async function importUrl(req: Request, res: Response, next: NextFunction) {
  try {
    const { url } = req.body as { url: string };
    if (!url) return res.status(400).json({ success: false, error: 'url is required' });
    const template = await service.importFromUrl(url);
    res.status(201).json({ success: true, data: template });
  } catch (err) {
    next(err);
  }
}

export async function cloneTemplate(req: Request<{ id: string }>, res: Response, next: NextFunction) {
  try {
    const template = await service.cloneMarketplaceTemplate(req.params.id);
    res.status(201).json({ success: true, data: template });
  } catch (err) {
    next(err);
  }
}
