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
  console.log('🔍 Validating environment variables...');
  console.log('NODE_ENV:', process.env.NODE_ENV || 'not set');
  console.log('PORT:', process.env.PORT || 'not set');
  console.log('DATABASE_URL length:', process.env.DATABASE_URL?.length || 0);
  console.log('JWT_SECRET length:', process.env.JWT_SECRET?.length || 0);
  console.log('BCRYPT_ROUNDS:', process.env.BCRYPT_ROUNDS || 'not set');
  console.log('LOG_LEVEL:', process.env.LOG_LEVEL || 'not set');
  console.log('ALLOWED_ORIGINS:', process.env.ALLOWED_ORIGINS || 'not set');
  
  try {
    const env = envSchema.parse(process.env);
    console.log('✅ Environment validation successful');
    return env;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Environment validation failed:');
      error.errors.forEach(err => {
        console.error(`- ${err.path.join('.')}: ${err.message}`);
      });
    } else {
      console.error('❌ Unexpected error during environment validation:', error);
    }
    process.exit(1);
  }
}