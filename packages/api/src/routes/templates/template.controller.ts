import type { Request, Response, NextFunction } from 'express';
import * as templateService from '../../services/template.service.js';
import { localStorage } from '../../services/local-storage.js';
import { templateRenderer } from '../../services/template-renderer.js';
import type { TemplateConfigSchema } from '@lpf/shared';

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await templateService.list(req.query as any);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}

export async function getById(req: Request<{ id: string }>, res: Response, next: NextFunction) {
  try {
    const template = await templateService.getById(req.params.id);
    res.json({ success: true, data: template });
  } catch (err) {
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const template = await templateService.create(req.body, req.user?.userId);
    res.status(201).json({ success: true, data: template });
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request<{ id: string }>, res: Response, next: NextFunction) {
  try {
    const template = await templateService.update(req.params.id, req.body, req.user?.userId);
    res.json({ success: true, data: template });
  } catch (err) {
    next(err);
  }
}

export async function remove(req: Request<{ id: string }>, res: Response, next: NextFunction) {
  try {
    await templateService.remove(req.params.id, req.user?.userId);
    res.json({ success: true, data: { message: 'Template deleted' } });
  } catch (err) {
    next(err);
  }
}

export async function upload(req: Request<{ id: string }>, res: Response, next: NextFunction) {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, error: 'No ZIP file uploaded' });
      return;
    }
    const template = await templateService.upload(req.params.id, req.file.buffer, req.user?.userId);
    res.json({ success: true, data: template });
  } catch (err) {
    next(err);
  }
}

export async function preview(req: Request<{ id: string }>, res: Response, next: NextFunction) {
  try {
    const template = await templateService.getById(req.params.id);
    if (!template.filePath) {
      res.status(404).send('<h1>No template files uploaded yet</h1>');
      return;
    }

    const templateDir = localStorage.getAbsolutePath(template.filePath);
    const assetBaseUrl = `/api/templates/${template.id}/assets`;

    // Use project config from query or default config
    let config: Record<string, unknown> = {};
    const schema = await templateService.getConfigSchema(template.id);
    if (schema) {
      config = templateRenderer.getDefaultConfig(schema);
    }

    const html = templateRenderer.render(templateDir, config, assetBaseUrl);
    res.type('html').send(html);
  } catch (err) {
    next(err);
  }
}

export async function listFiles(req: Request<{ id: string }>, res: Response, next: NextFunction) {
  try {
    const template = await templateService.getById(req.params.id);
    if (!template.filePath || template.version === 0) {
      res.json({ success: true, data: { files: [] } });
      return;
    }
    const files = localStorage.listFiles(template.id, template.version);
    res.json({ success: true, data: { files, version: template.version } });
  } catch (err) {
    next(err);
  }
}

export async function clone(req: Request<{ id: string }>, res: Response, next: NextFunction) {
  try {
    const { default: cloneService } = await import('../../services/template-clone.service.js');
    const template = await cloneService.clone(req.params.id, req.body, req.user?.userId);
    res.status(201).json({ success: true, data: template });
  } catch (err) {
    next(err);
  }
}

export async function exportTemplate(req: Request<{ id: string }>, res: Response, next: NextFunction) {
  try {
    const template = await templateService.getById(req.params.id);
    const zipBuffer = await templateService.exportZip(req.params.id);
    res.set({
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${template.slug}.zip"`,
    });
    res.send(zipBuffer);
  } catch (err) {
    next(err);
  }
}

export async function importTemplate(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, error: 'No ZIP file uploaded' });
      return;
    }
    const { name, slug, category } = req.body;
    if (!name || !slug) {
      res.status(400).json({ success: false, error: 'Name and slug are required' });
      return;
    }
    const template = await templateService.importZip(
      req.file.buffer,
      { name, slug, category },
      req.user?.userId,
    );
    res.status(201).json({ success: true, data: template });
  } catch (err) {
    next(err);
  }
}

export async function listVersions(req: Request<{ id: string }>, res: Response, next: NextFunction) {
  try {
    const { prisma } = await import('../../lib/prisma.js');
    const versions = await prisma.templateVersion.findMany({
      where: { templateId: req.params.id },
      orderBy: { version: 'desc' },
      include: { uploader: { select: { name: true } } },
    });
    res.json({ success: true, data: versions });
  } catch (err) {
    next(err);
  }
}
