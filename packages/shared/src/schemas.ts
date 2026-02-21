import { z } from 'zod';
import {
  ProjectStatus,
  DeployTarget,
  TemplateStatus,
  UserRole,
  ApprovalStatus,
} from './enums.js';

// Auth schemas
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
});

// Template schemas
export const createTemplateSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  category: z.string().min(1, 'Category is required'),
  description: z.string().optional().default(''),
  previewUrl: z.string().url().nullable().optional(),
  thumbnailUrl: z.string().url().nullable().optional(),
  techStack: z.array(z.string()).optional().default([]),
  plugins: z.array(z.string()).optional().default([]),
  status: z.nativeEnum(TemplateStatus).optional().default(TemplateStatus.DRAFT),
  configSchema: z.record(z.unknown()).nullable().optional(),
});

export const updateTemplateSchema = createTemplateSchema.partial();

// Clone template schema
export const cloneTemplateSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
});

// Client schemas
export const createClientSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email().nullable().optional(),
  phone: z.string().nullable().optional(),
  company: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
});

export const updateClientSchema = createClientSchema.partial();

// Project schemas
export const createProjectSchema = z.object({
  clientId: z.string().uuid('Invalid client ID'),
  templateId: z.string().uuid('Invalid template ID'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  domain: z.string().nullable().optional(),
  status: z.nativeEnum(ProjectStatus).optional().default(ProjectStatus.DRAFT),
  deployTarget: z.nativeEnum(DeployTarget).nullable().optional(),
  config: z.record(z.unknown()).nullable().optional(),
});

export const updateProjectSchema = createProjectSchema.partial();

export const updateProjectStatusSchema = z.object({
  status: z.nativeEnum(ProjectStatus),
});

// User management schemas (ADMIN)
export const createUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  role: z.nativeEnum(UserRole).optional().default(UserRole.EDITOR),
});

export const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  role: z.nativeEnum(UserRole).optional(),
  isActive: z.boolean().optional(),
});

// Activity log query schema
export const activityLogQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  userId: z.string().uuid().optional(),
  action: z.string().optional(),
  entityType: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
});

// Comment schemas
export const createCommentSchema = z.object({
  authorName: z.string().min(1, 'Name is required'),
  content: z.string().min(1, 'Comment is required'),
});

// Preview token schema
export const createPreviewTokenSchema = z.object({
  expiresInDays: z.coerce.number().int().positive().max(90).optional().default(7),
});

// Approval status schema
export const updateApprovalSchema = z.object({
  status: z.nativeEnum(ApprovalStatus),
});

// Pagination schema
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  search: z.string().optional(),
  sortBy: z.string().optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

// Inferred types
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type CreateTemplateInput = z.infer<typeof createTemplateSchema>;
export type UpdateTemplateInput = z.infer<typeof updateTemplateSchema>;
export type CloneTemplateInput = z.infer<typeof cloneTemplateSchema>;
export type CreateClientInput = z.infer<typeof createClientSchema>;
export type UpdateClientInput = z.infer<typeof updateClientSchema>;
export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type UpdateProjectStatusInput = z.infer<typeof updateProjectStatusSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type ActivityLogQueryInput = z.infer<typeof activityLogQuerySchema>;
export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type CreatePreviewTokenInput = z.infer<typeof createPreviewTokenSchema>;
export type UpdateApprovalInput = z.infer<typeof updateApprovalSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
