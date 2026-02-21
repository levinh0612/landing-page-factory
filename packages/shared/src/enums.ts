export enum UserRole {
  ADMIN = 'ADMIN',
  EDITOR = 'EDITOR',
  VIEWER = 'VIEWER',
}

export enum ProjectStatus {
  DRAFT = 'DRAFT',
  IN_PROGRESS = 'IN_PROGRESS',
  READY = 'READY',
  DEPLOYED = 'DEPLOYED',
  ARCHIVED = 'ARCHIVED',
}

export enum DeployTarget {
  VERCEL = 'VERCEL',
  NETLIFY = 'NETLIFY',
  CLOUDFLARE = 'CLOUDFLARE',
  CUSTOM = 'CUSTOM',
}

export enum TemplateStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  DEPRECATED = 'DEPRECATED',
}

export enum DeploymentStatus {
  PENDING = 'PENDING',
  BUILDING = 'BUILDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  ROLLED_BACK = 'ROLLED_BACK',
}

export enum HealthCheckStatus {
  HEALTHY = 'HEALTHY',
  DEGRADED = 'DEGRADED',
  DOWN = 'DOWN',
  UNKNOWN = 'UNKNOWN',
}

export enum ApprovalStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  CHANGES_REQUESTED = 'CHANGES_REQUESTED',
}

export enum PostStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

export enum CommentStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  SPAM = 'SPAM',
  TRASH = 'TRASH',
}

export enum SettingType {
  STRING = 'STRING',
  BOOLEAN = 'BOOLEAN',
  NUMBER = 'NUMBER',
  JSON = 'JSON',
}
