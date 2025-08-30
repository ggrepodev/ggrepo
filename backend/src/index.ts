import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';
import { validateEnv } from './utils/validateEnv';
import { initializeDatabase, closeDatabase } from './db';
import { healthRouter } from './routes/health';
import { apiRouter } from './routes/api';

console.log('🔄 Step 1: Loading dotenv...');
dotenv.config();

console.log('🔄 Step 2: Validating environment...');
try {
  validateEnv();
  console.log('✅ Environment validation passed');
} catch (error) {
  console.error('❌ Environment validation failed:', error);
  process.exit(1);
}

console.log('🔄 Step 3: Initializing database...');
try {
  initializeDatabase();
  console.log('✅ Database connected successfully');
} catch (error) {
  console.error('❌ Database connection failed:', error);
  process.exit(1);
}

console.log('🔄 Step 4: Creating Express app...');
const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);
const isProduction = process.env.NODE_ENV === 'production';
console.log(`✅ Express app created, PORT: ${PORT}, Production: ${isProduction}`);

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isProduction ? 100 : 1000,
  message: 'Too many requests from this IP',
  standardHeaders: true,
  legacyHeaders: false,
});

app.set('trust proxy', 1);

app.use(helmet({
  contentSecurityPolicy: isProduction ? undefined : false,
  crossOriginEmbedderPolicy: false,
}));

app.use(cors({
  origin: isProduction
    ? process.env.ALLOWED_ORIGINS?.split(',') || false
    : true,
  credentials: true,
}));

app.use(compression());
app.use(limiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(morgan('combined', {
  stream: { write: (message) => logger.info(message.trim()) },
  skip: (req) => req.url === '/health',
}));

app.use(requestLogger);

app.use('/health', healthRouter);
app.use('/api/v1', apiRouter);

app.get('/', (_req, res) => {
  res.json({
    name: 'ggrepo API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/health',
      api: '/api/v1',
    },
  });
});

app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method,
  });
});

app.use(errorHandler);

console.log('🔄 Step 5: Starting server...');
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 SERVER STARTED SUCCESSFULLY on 0.0.0.0:${PORT}`);
  console.log(`📊 Health check: http://0.0.0.0:${PORT}/health`);
  console.log(`🔌 API endpoint: http://0.0.0.0:${PORT}/api/v1`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

server.on('error', (error) => {
  console.error('❌ Server failed to start:', error);
  process.exit(1);
});

const gracefulShutdown = (signal: string) => {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);

  server.close(async (error) => {
    if (error) {
      logger.error('Error during server close:', error);
      process.exit(1);
    }

    try {
      logger.info('HTTP server closed.');
      await closeDatabase();
      logger.info('Database connections closed.');
      logger.info('Graceful shutdown completed.');
      process.exit(0);
    } catch (dbError) {
      logger.error('Error closing database connections:', dbError);
      process.exit(1);
    }
  });

  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
