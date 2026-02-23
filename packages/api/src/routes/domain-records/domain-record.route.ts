import { Router } from 'express';
import { createDomainRecordSchema, updateDomainRecordSchema, paginationSchema } from '@lpf/shared';
import { validate } from '../../middleware/validate.js';
import { authenticate } from '../../middleware/auth.js';
import { authorize } from '../../middleware/authorize.js';
import * as domainRecordController from './domain-record.controller.js';

export const domainRecordRoutes = Router();

domainRecordRoutes.use(authenticate);

domainRecordRoutes.get('/', validate(paginationSchema, 'query'), domainRecordController.list);
domainRecordRoutes.get('/:id', domainRecordController.getById);

domainRecordRoutes.post(
  '/',
  authorize('ADMIN', 'EDITOR'),
  validate(createDomainRecordSchema),
  domainRecordController.create,
);
domainRecordRoutes.patch(
  '/:id',
  authorize('ADMIN', 'EDITOR'),
  validate(updateDomainRecordSchema),
  domainRecordController.update,
);
domainRecordRoutes.delete('/:id', authorize('ADMIN', 'EDITOR'), domainRecordController.remove);
domainRecordRoutes.post(
  '/:id/refresh-whois',
  authorize('ADMIN', 'EDITOR'),
  domainRecordController.refreshWhois,
);
