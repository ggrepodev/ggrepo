import { Router } from 'express';
import { logger } from '../utils/logger';
import { sendSuccess } from '../utils/response';

const router = Router();

router.get('/', (req, res) => {
  const apiInfo = {
    name: 'ggrepo API',
    version: '1.0.0',
    description: 'Backend API for ggrepo devtool',
    endpoints: {
      health: '/health',
      users: '/api/v1/users',
      repositories: '/api/v1/repositories',
    },
    documentation: {
      openapi: '/api/v1/docs',
      postman: '/api/v1/postman',
    },
    support: {
      issues: 'https://github.com/ggrepo/ggrepo/issues',
      documentation: 'https://docs.ggrepo.dev',
    },
  };

  sendSuccess(res, apiInfo, 'API information retrieved successfully');
});

router.get('/status', (req, res) => {
  const status = {
    api: 'operational',
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    rateLimit: {
      remaining: res.get('X-RateLimit-Remaining'),
      resetTime: res.get('X-RateLimit-Reset'),
    },
  };

  sendSuccess(res, status, 'API status retrieved successfully');
});

router.use((req, res, next) => {
  logger.info(`API request: ${req.method} ${req.path}`, {
    method: req.method,
    path: req.path,
    query: req.query,
    ip: req.ip,
  });
  next();
});

export { router as apiRouter };