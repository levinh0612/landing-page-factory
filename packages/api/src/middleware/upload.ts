import multer from 'multer';
import { AppError } from './error.js';

const MAX_SIZE = 50 * 1024 * 1024; // 50MB

export const uploadZip = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_SIZE },
  fileFilter: (_req, file, cb) => {
    if (
      file.mimetype === 'application/zip' ||
      file.mimetype === 'application/x-zip-compressed' ||
      file.originalname.endsWith('.zip')
    ) {
      cb(null, true);
    } else {
      cb(new AppError(400, 'Only .zip files are allowed'));
    }
  },
});
