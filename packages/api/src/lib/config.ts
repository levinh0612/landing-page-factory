import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(8),
  JWT_EXPIRES_IN: z.string().default('7d'),
  API_PORT: z.coerce.number().default(5001),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  VERCEL_TOKEN: z.string().optional(),
  NETLIFY_TOKEN: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  ADMIN_EMAIL: z.string().email().optional(),
  PAYOS_CLIENT_ID: z.string().optional(),
  PAYOS_API_KEY: z.string().optional(),
  PAYOS_CHECKSUM_KEY: z.string().optional(),
  PUBLIC_API_URL: z.string().url().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const config = parsed.data;
