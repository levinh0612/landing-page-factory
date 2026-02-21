import type { Request, Response, NextFunction } from 'express';
import { prisma } from '../../lib/prisma.js';
import https from 'https';
import http from 'http';

export async function systemInfo(_req: Request, res: Response, next: NextFunction) {
  try {
    const mem = process.memoryUsage();
    res.json({
      success: true,
      data: {
        uptime: process.uptime(),
        nodeVersion: process.version,
        platform: process.platform,
        memory: {
          rss: Math.round(mem.rss / 1024 / 1024),
          heapUsed: Math.round(mem.heapUsed / 1024 / 1024),
          heapTotal: Math.round(mem.heapTotal / 1024 / 1024),
        },
        timestamp: new Date().toISOString(),
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function projectsHealth(_req: Request, res: Response, next: NextFunction) {
  try {
    const projects = await prisma.project.findMany({
      where: { deployUrl: { not: null } },
      select: {
        id: true,
        name: true,
        slug: true,
        deployUrl: true,
        status: true,
        healthChecks: {
          orderBy: { checkedAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: projects });
  } catch (err) {
    next(err);
  }
}

export async function pingProject(req: Request<{ id: string }>, res: Response, next: NextFunction) {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
      select: { id: true, deployUrl: true },
    });

    if (!project?.deployUrl) {
      return res.status(404).json({ success: false, error: 'Project or deploy URL not found' });
    }

    const start = Date.now();
    const targetUrl = project.deployUrl;
    const protocol = targetUrl.startsWith('https') ? https : http;

    try {
      await new Promise<void>((resolve, reject) => {
        const httpReq = protocol.get(targetUrl, (httpRes) => {
          httpRes.destroy();
          resolve();
        });
        httpReq.on('error', reject);
        httpReq.setTimeout(10000, () => {
          httpReq.destroy();
          reject(new Error('Timeout'));
        });
      });

      const responseTimeMs = Date.now() - start;
      const healthCheck = await prisma.healthCheck.create({
        data: { projectId: project.id, status: 'HEALTHY', responseTimeMs },
      });
      res.json({ success: true, data: healthCheck });
    } catch {
      const responseTimeMs = Date.now() - start;
      const healthCheck = await prisma.healthCheck.create({
        data: { projectId: project.id, status: 'DOWN', responseTimeMs },
      });
      res.json({ success: true, data: healthCheck });
    }
  } catch (err) {
    next(err);
  }
}
