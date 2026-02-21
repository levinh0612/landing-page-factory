import type {
  UserRole,
  ProjectStatus,
  DeployTarget,
  TemplateStatus,
  DeploymentStatus,
  HealthCheckStatus,
  ApprovalStatus,
} from './enums.js';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Template {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string;
  previewUrl: string | null;
  thumbnailUrl: string | null;
  techStack: string[];
  plugins: string[];
  status: TemplateStatus;
  configSchema: Record<string, unknown> | null;
  version: number;
  filePath: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Client {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  clientId: string;
  templateId: string;
  name: string;
  slug: string;
  domain: string | null;
  status: ProjectStatus;
  deployTarget: DeployTarget | null;
  deployUrl: string | null;
  config: Record<string, unknown> | null;
  approvalStatus: ApprovalStatus;
  createdAt: string;
  updatedAt: string;
  client?: Client;
  template?: Template;
}

export interface Deployment {
  id: string;
  projectId: string;
  version: string;
  status: DeploymentStatus;
  platform: string;
  deployUrl: string | null;
  logs: string | null;
  deployedBy: string | null;
  buildTime: number | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export interface HealthCheck {
  id: string;
  projectId: string;
  status: HealthCheckStatus;
  responseTimeMs: number | null;
  sslExpiry: string | null;
  checkedAt: string;
}

export interface ActivityLog {
  id: string;
  projectId: string | null;
  userId: string;
  action: string;
  details: string | null;
  entityType: string | null;
  entityId: string | null;
  createdAt: string;
  user?: { name: string; email: string };
}

export interface TemplateVersion {
  id: string;
  templateId: string;
  version: number;
  filePath: string;
  fileCount: number;
  fileSize: number;
  uploadedBy: string | null;
  createdAt: string;
  uploader?: { name: string };
}

export interface PreviewToken {
  id: string;
  projectId: string;
  token: string;
  expiresAt: string;
  createdBy: string;
  createdAt: string;
}

export interface Comment {
  id: string;
  projectId: string;
  userId: string | null;
  authorName: string;
  content: string;
  isClient: boolean;
  createdAt: string;
}

// API Response types
export interface ApiResponse<T> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  error: string;
  details?: unknown;
}

export interface PaginatedResponse<T> {
  success: true;
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Dashboard stats
export interface DashboardStats {
  totalTemplates: number;
  totalClients: number;
  totalProjects: number;
  activeProjects: number;
  recentActivity: ActivityLog[];
}
