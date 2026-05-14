import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(3001),

  MONGODB_URI: z.string().min(1),
  MONGODB_DB: z.string().min(1).default('optitime'),

  REDIS_URL: z.string().min(1),

  AI_SERVICE_URL: z.string().min(1).default('http://localhost:8000'),
  AI_SERVICE_HMAC_SECRET: z.string().min(1).default('dev_ai_hmac_change_me'),

  WEAVIATE_URL: z.string().min(1).default('http://localhost:8080'),
  WEAVIATE_API_KEY: z.string().optional(),

  FIREBASE_PROJECT_ID: z.string().min(1),
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
