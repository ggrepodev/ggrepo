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

dotenv.config();
validateEnv();

// database connection
try {
  initializeDatabase();
  logger.info('📊 Database connected successfully');
} catch (error) {
  logger.error('❌ Failed to connect to database:', error);
  process.exit(1);
}

const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);
const isProduction = process.env.NODE_ENV === 'production';

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

app.get('/', (req, res) => {
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

const server = app.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`);
  logger.info(`📊 Health check: http://localhost:${PORT}/health`);
  logger.info(`🔌 API endpoint: http://localhost:${PORT}/api/v1`);
  logger.info(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
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
