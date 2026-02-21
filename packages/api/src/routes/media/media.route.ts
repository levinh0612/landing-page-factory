import { Router } from 'express';
import path from 'path';
import multer from 'multer';
import { authenticate } from '../../middleware/auth.js';
import * as controller from './media.controller.js';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'media');

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/[^a-z0-9]/gi, '-').toLowerCase();
    cb(null, `${base}-${Date.now()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/', 'video/', 'application/pdf', 'application/zip'];
    if (allowed.some((t) => file.mimetype.startsWith(t))) cb(null, true);
    else cb(new Error('File type not allowed'));
  },
});

export const mediaRoutes = Router();
mediaRoutes.use(authenticate);

mediaRoutes.get('/', controller.list);
mediaRoutes.post('/upload', upload.single('file'), controller.upload);
mediaRoutes.delete('/:id', controller.remove);
