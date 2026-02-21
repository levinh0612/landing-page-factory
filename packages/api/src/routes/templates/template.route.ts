import { Router } from 'express';
import path from 'node:path';
import { createTemplateSchema, updateTemplateSchema, paginationSchema, cloneTemplateSchema } from '@lpf/shared';
import { validate } from '../../middleware/validate.js';
import { authenticate } from '../../middleware/auth.js';
import { authorize } from '../../middleware/authorize.js';
import { uploadZip } from '../../middleware/upload.js';
import { localStorage } from '../../services/local-storage.js';
import * as templateService from '../../services/template.service.js';
import * as templateController from './template.controller.js';

export const templateRoutes = Router();

// Preview and assets are public (for iframe embedding)
templateRoutes.get('/:id/preview', templateController.preview);

// Serve template static assets: GET /api/templates/:id/assets/*
templateRoutes.get('/:id/assets/*', async (req, res, next) => {
  try {
    const template = await templateService.getById(req.params.id);
    if (!template.filePath) {
      res.status(404).json({ success: false, error: 'No template files' });
      return;
    }

    // Extract the asset subpath from the wildcard param
    const wildcardParts = req.params[''] as unknown as string[];
    const assetSubpath = Array.isArray(wildcardParts) ? wildcardParts.join('/') : String(wildcardParts);
    const templateDir = localStorage.getAbsolutePath(template.filePath);
    const requestedPath = path.resolve(templateDir, assetSubpath);

    // Prevent path traversal
    if (!requestedPath.startsWith(templateDir)) {
      res.status(403).json({ success: false, error: 'Forbidden' });
      return;
    }

    res.sendFile(requestedPath, (err) => {
      if (err) res.status(404).json({ success: false, error: 'Asset not found' });
    });
  } catch (err) {
    next(err);
  }
});

// Protected routes
templateRoutes.use(authenticate);

templateRoutes.get('/', validate(paginationSchema, 'query'), templateController.list);
templateRoutes.get('/:id', templateController.getById);
templateRoutes.get('/:id/files', templateController.listFiles);
templateRoutes.get('/:id/versions', templateController.listVersions);
templateRoutes.get('/:id/export', templateController.exportTemplate);

// Write operations require ADMIN or EDITOR
templateRoutes.post('/', authorize('ADMIN', 'EDITOR'), validate(createTemplateSchema), templateController.create);
templateRoutes.post('/import', authorize('ADMIN', 'EDITOR'), uploadZip.single('template'), templateController.importTemplate);
templateRoutes.post('/:id/upload', authorize('ADMIN', 'EDITOR'), uploadZip.single('template'), templateController.upload);
templateRoutes.post('/:id/clone', authorize('ADMIN', 'EDITOR'), validate(cloneTemplateSchema), templateController.clone);
templateRoutes.patch('/:id', authorize('ADMIN', 'EDITOR'), validate(updateTemplateSchema), templateController.update);
templateRoutes.delete('/:id', authorize('ADMIN', 'EDITOR'), templateController.remove);
