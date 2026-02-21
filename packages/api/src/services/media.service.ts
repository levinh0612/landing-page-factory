import path from 'path';
import fs from 'fs/promises';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../middleware/error.js';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'media');

export async function ensureUploadDir() {
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
}

export async function list(query: { page: number; limit: number; type?: string }) {
  const { page, limit, type } = query;
  const skip = (page - 1) * limit;

  const where = type ? { mimeType: { startsWith: type } } : {};

  const [data, total] = await Promise.all([
    prisma.mediaFile.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
    prisma.mediaFile.count({ where }),
  ]);

  return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
}

export async function create(file: Express.Multer.File, uploadedBy?: string) {
  const mediaFile = await prisma.mediaFile.create({
    data: {
      filename: file.filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      url: `/api/media/files/${file.filename}`,
      uploadedBy: uploadedBy ?? null,
    },
  });
  return mediaFile;
}

export async function remove(id: string) {
  const mediaFile = await prisma.mediaFile.findUnique({ where: { id } });
  if (!mediaFile) throw new AppError(404, 'Media file not found');

  const filePath = path.join(UPLOAD_DIR, mediaFile.filename);
  try {
    await fs.unlink(filePath);
  } catch {
    // file may already be gone
  }

  await prisma.mediaFile.delete({ where: { id } });
}
