import type { Request, Response, NextFunction } from 'express';
import * as postService from '../../services/post.service.js';

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const search = req.query.search ? String(req.query.search) : undefined;
    const status = req.query.status ? String(req.query.status) : undefined;
    const result = await postService.list({ page, limit, search, status });
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}

export async function getById(req: Request<{ id: string }>, res: Response, next: NextFunction) {
  try {
    const post = await postService.getById(req.params.id);
    res.json({ success: true, data: post });
  } catch (err) {
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const post = await postService.create({ ...req.body, authorId: req.user?.userId });
    res.status(201).json({ success: true, data: post });
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request<{ id: string }>, res: Response, next: NextFunction) {
  try {
    const post = await postService.update(req.params.id, req.body);
    res.json({ success: true, data: post });
  } catch (err) {
    next(err);
  }
}

export async function remove(req: Request<{ id: string }>, res: Response, next: NextFunction) {
  try {
    await postService.remove(req.params.id);
    res.json({ success: true, data: { message: 'Deleted' } });
  } catch (err) {
    next(err);
  }
}

export async function listCategories(_req: Request, res: Response, next: NextFunction) {
  try {
    const categories = await postService.listCategories();
    res.json({ success: true, data: categories });
  } catch (err) {
    next(err);
  }
}

export async function createCategory(req: Request, res: Response, next: NextFunction) {
  try {
    const category = await postService.createCategory(req.body);
    res.status(201).json({ success: true, data: category });
  } catch (err) {
    next(err);
  }
}

export async function listTags(_req: Request, res: Response, next: NextFunction) {
  try {
    const tags = await postService.listTags();
    res.json({ success: true, data: tags });
  } catch (err) {
    next(err);
  }
}

export async function createTag(req: Request, res: Response, next: NextFunction) {
  try {
    const tag = await postService.createTag(req.body);
    res.status(201).json({ success: true, data: tag });
  } catch (err) {
    next(err);
  }
}
