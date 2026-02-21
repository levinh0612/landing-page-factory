import type { Request, Response, NextFunction } from 'express';
import * as projectService from '../../services/project.service.js';
import * as templateService from '../../services/template.service.js';
import * as previewTokenService from '../../services/preview-token.service.js';
import * as commentService from '../../services/comment.service.js';
import * as approvalService from '../../services/approval.service.js';
import { localStorage } from '../../services/local-storage.js';
import { templateRenderer } from '../../services/template-renderer.js';

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
    const project = await projectService.create(req.body, req.user?.userId);
    res.status(201).json({ success: true, data: project });
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request<{ id: string }>, res: Response, next: NextFunction) {
  try {
    const project = await projectService.update(req.params.id, req.body, req.user?.userId);
    res.json({ success: true, data: project });
  } catch (err) {
    next(err);
  }
}

export async function updateStatus(req: Request<{ id: string }>, res: Response, next: NextFunction) {
  try {
    const project = await projectService.updateStatus(req.params.id, req.body, req.user?.userId);
    res.json({ success: true, data: project });
  } catch (err) {
    next(err);
  }
}

export async function remove(req: Request<{ id: string }>, res: Response, next: NextFunction) {
  try {
    await projectService.remove(req.params.id, req.user?.userId);
    res.json({ success: true, data: { message: 'Project deleted' } });
  } catch (err) {
    next(err);
  }
}

export async function preview(req: Request<{ id: string }>, res: Response, next: NextFunction) {
  try {
    const project = await projectService.getById(req.params.id);
    const template = await templateService.getById(project.templateId);

    if (!template.filePath) {
      res.status(404).send('<h1>Template has no uploaded files</h1>');
      return;
    }

    const templateDir = localStorage.getAbsolutePath(template.filePath);
    const assetBaseUrl = `/api/templates/${template.id}/assets`;

    // Start with default config, then overlay project-specific config
    let config: Record<string, unknown> = {};
    const schema = await templateService.getConfigSchema(template.id);
    if (schema) {
      config = templateRenderer.getDefaultConfig(schema);
    }
    if (project.config && typeof project.config === 'object') {
      config = { ...config, ...(project.config as Record<string, unknown>) };
    }

    const html = templateRenderer.render(templateDir, config, assetBaseUrl);
    res.type('html').send(html);
  } catch (err) {
    next(err);
  }
}

// Preview token routes
export async function generatePreviewToken(req: Request<{ id: string }>, res: Response, next: NextFunction) {
  try {
    const token = await previewTokenService.generate(
      req.params.id,
      req.user!.userId,
      req.body.expiresInDays,
    );
    res.status(201).json({ success: true, data: token });
  } catch (err) {
    next(err);
  }
}

export async function listPreviewTokens(req: Request<{ id: string }>, res: Response, next: NextFunction) {
  try {
    const tokens = await previewTokenService.listByProject(req.params.id);
    res.json({ success: true, data: tokens });
  } catch (err) {
    next(err);
  }
}

export async function revokePreviewToken(
  req: Request<{ id: string; tokenId: string }>,
  res: Response,
  next: NextFunction,
) {
  try {
    await previewTokenService.revoke(req.params.tokenId);
    res.json({ success: true, data: { message: 'Token revoked' } });
  } catch (err) {
    next(err);
  }
}

// Comment routes
export async function listComments(req: Request<{ id: string }>, res: Response, next: NextFunction) {
  try {
    const comments = await commentService.listByProject(req.params.id);
    res.json({ success: true, data: comments });
  } catch (err) {
    next(err);
  }
}

export async function addComment(req: Request<{ id: string }>, res: Response, next: NextFunction) {
  try {
    const comment = await commentService.create({
      projectId: req.params.id,
      userId: req.user?.userId,
      authorName: req.body.authorName || req.user?.userId || 'Admin',
      content: req.body.content,
      isClient: false,
    });
    res.status(201).json({ success: true, data: comment });
  } catch (err) {
    next(err);
  }
}

// Approval route
export async function updateApproval(req: Request<{ id: string }>, res: Response, next: NextFunction) {
  try {
    const project = await approvalService.updateStatus(
      req.params.id,
      req.body.status,
      undefined,
      req.user?.userId,
    );
    res.json({ success: true, data: project });
  } catch (err) {
    next(err);
  }
}

// Deploy route
export async function deploy(req: Request<{ id: string }>, res: Response, next: NextFunction) {
  try {
    const { triggerDeploy } = await import('../../services/deployment.service.js');
    const deployment = await triggerDeploy(req.params.id, req.user!.userId);
    res.status(201).json({ success: true, data: deployment });
  } catch (err) {
    next(err);
  }
}

// Vercel domain management
export async function listVercelDomains(req: Request<{ id: string }>, res: Response, next: NextFunction) {
  try {
    const { prisma } = await import('../../lib/prisma.js');
    const project = await prisma.project.findUniqueOrThrow({ where: { id: req.params.id } });
    const { listDomains } = await import('../../services/deploy/vercel.service.js');
    const domains = await listDomains(project.slug);
    res.json({ success: true, data: domains });
  } catch (err) {
    next(err);
  }
}

export async function addVercelDomain(req: Request<{ id: string }>, res: Response, next: NextFunction) {
  try {
    const { prisma } = await import('../../lib/prisma.js');
    const project = await prisma.project.findUniqueOrThrow({ where: { id: req.params.id } });
    const { addDomain } = await import('../../services/deploy/vercel.service.js');
    const domain = await addDomain(project.slug, req.body.domain);
    // Also save to our DB
    await prisma.project.update({ where: { id: req.params.id }, data: { domain: req.body.domain } });
    res.json({ success: true, data: domain });
  } catch (err) {
    next(err);
  }
}

export async function removeVercelDomain(
  req: Request<{ id: string; domain: string }>,
  res: Response,
  next: NextFunction,
) {
  try {
    const { prisma } = await import('../../lib/prisma.js');
    const project = await prisma.project.findUniqueOrThrow({ where: { id: req.params.id } });
    const { removeDomain } = await import('../../services/deploy/vercel.service.js');
    await removeDomain(project.slug, req.params.domain);
    // Clear from DB if it matches
    if (project.domain === req.params.domain) {
      await prisma.project.update({ where: { id: req.params.id }, data: { domain: null } });
    }
    res.json({ success: true, data: { message: 'Domain removed' } });
  } catch (err) {
    next(err);
  }
}

export async function listDeployments(req: Request<{ id: string }>, res: Response, next: NextFunction) {
  try {
    const { prisma } = await import('../../lib/prisma.js');
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      prisma.deployment.findMany({
        where: { projectId: req.params.id },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: { deployer: { select: { name: true } } },
      }),
      prisma.deployment.count({ where: { projectId: req.params.id } }),
    ]);

    res.json({
      success: true,
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
}
