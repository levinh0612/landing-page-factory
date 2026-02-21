import type { Request, Response, NextFunction } from 'express';
import * as previewTokenService from '../../services/preview-token.service.js';
import * as commentService from '../../services/comment.service.js';
import * as approvalService from '../../services/approval.service.js';
import * as templateService from '../../services/template.service.js';
import { localStorage } from '../../services/local-storage.js';
import { templateRenderer } from '../../services/template-renderer.js';

export async function getPortal(req: Request<{ token: string }>, res: Response, next: NextFunction) {
  try {
    const { project, token } = await previewTokenService.validate(req.params.token);
    res.json({
      success: true,
      data: {
        project: {
          id: project.id,
          name: project.name,
          slug: project.slug,
          status: project.status,
          approvalStatus: project.approvalStatus,
          client: project.client,
          template: {
            name: project.template.name,
            category: project.template.category,
          },
        },
        expiresAt: token.expiresAt,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function previewProject(req: Request<{ token: string }>, res: Response, next: NextFunction) {
  try {
    const { project } = await previewTokenService.validate(req.params.token);
    const template = await templateService.getById(project.templateId);

    if (!template.filePath) {
      res.status(404).send('<h1>Template has no uploaded files</h1>');
      return;
    }

    const templateDir = localStorage.getAbsolutePath(template.filePath);
    const assetBaseUrl = `/api/templates/${template.id}/assets`;

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

export async function listComments(req: Request<{ token: string }>, res: Response, next: NextFunction) {
  try {
    const { project } = await previewTokenService.validate(req.params.token);
    const comments = await commentService.listByProject(project.id);
    res.json({ success: true, data: comments });
  } catch (err) {
    next(err);
  }
}

export async function addComment(req: Request<{ token: string }>, res: Response, next: NextFunction) {
  try {
    const { project } = await previewTokenService.validate(req.params.token);
    const comment = await commentService.create({
      projectId: project.id,
      authorName: req.body.authorName,
      content: req.body.content,
      isClient: true,
    });
    res.status(201).json({ success: true, data: comment });
  } catch (err) {
    next(err);
  }
}

export async function approve(req: Request<{ token: string }>, res: Response, next: NextFunction) {
  try {
    const { project } = await previewTokenService.validate(req.params.token);
    const updated = await approvalService.updateStatus(project.id, 'APPROVED', req.params.token);
    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
}

export async function requestChanges(req: Request<{ token: string }>, res: Response, next: NextFunction) {
  try {
    const { project } = await previewTokenService.validate(req.params.token);
    const updated = await approvalService.updateStatus(project.id, 'CHANGES_REQUESTED', req.params.token);
    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
}
