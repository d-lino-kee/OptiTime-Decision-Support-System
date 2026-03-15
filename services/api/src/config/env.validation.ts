import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z.string().default('development'),
  PORT: z.coerce.number().default(3001),

  MONGODB_URI: z.string().min(1),
  MONGODB_DB: z.string().min(1).default('optitime'),

  REDIS_URL: z.string().min(1),

  AI_SERVICE_URL: z.string().min(1).default('http://localhost:8001'),
  WEAVIATE_URL: z.string().min(1).default('http://localhost:8080'),

  SERVICE_AUTH_SECRET: z.string().min(1).default('dev_secret_change_me'),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(raw: Record<string, unknown>): Env {
  const parsed = envSchema.safeParse(raw);
  if (!parsed.success) {
    const message = parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('\n');
    throw new Error(`Invalid environment variables:\n${message}`);
  }
  return parsed.data;
}
