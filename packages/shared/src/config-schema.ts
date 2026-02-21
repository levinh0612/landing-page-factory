import { z } from 'zod';

// Field types supported in config forms
export type ConfigFieldType = 'text' | 'textarea' | 'color' | 'url' | 'boolean' | 'select';

export interface ConfigField {
  key: string;
  label: string;
  type: ConfigFieldType;
  default: string | boolean;
  required?: boolean;
  options?: string[]; // Only for type: 'select'
}

export interface TemplateConfigSchema {
  fields: ConfigField[];
}

// Zod schemas
export const configFieldSchema = z.object({
  key: z.string().min(1),
  label: z.string().min(1),
  type: z.enum(['text', 'textarea', 'color', 'url', 'boolean', 'select']),
  default: z.union([z.string(), z.boolean()]),
  required: z.boolean().optional(),
  options: z.array(z.string()).optional(),
});

export const templateConfigSchema = z.object({
  fields: z.array(configFieldSchema),
});
