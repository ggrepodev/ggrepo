import { z } from 'zod';
import { logger } from './logger';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().regex(/^\d+$/).default('3001'),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  BCRYPT_ROUNDS: z.string().regex(/^\d+$/).default('10'),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  ALLOWED_ORIGINS: z.string().optional(),
});

export function validateEnv() {
  try {
    const env = envSchema.parse(process.env);
    logger.info('Environment validation successful');
    return env;
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.error('Environment validation failed:', {
        errors: error.errors.map(err => `${err.path.join('.')}: ${err.message}`),
      });
    } else {
      logger.error('Unexpected error during environment validation:', error);
    }
    process.exit(1);
  }
}