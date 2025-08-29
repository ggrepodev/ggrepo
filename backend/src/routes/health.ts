import { Router } from 'express';
import { getDb } from '../db';
import { logger } from '../utils/logger';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const startTime = Date.now();
    const db = getDb();
    
    await db.execute('SELECT 1');
    const dbResponseTime = Date.now() - startTime;
    
    const healthData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
      database: {
        status: 'connected',
        responseTime: `${dbResponseTime}ms`,
      },
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        external: Math.round(process.memoryUsage().external / 1024 / 1024),
      },
      system: {
        platform: process.platform,
        nodeVersion: process.version,
      },
    };

    if (dbResponseTime > 1000) {
      logger.warn('Database response time is slow', { responseTime: dbResponseTime });
    }

    res.json(healthData);
  } catch (error) {
    logger.error('Health check failed:', error);
    
    const errorData = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Database connection failed',
      database: {
        status: 'disconnected',
      },
    };

    res.status(503).json(errorData);
  }
});

router.get('/ready', async (req, res) => {
  try {
    const db = getDb();
    await db.execute('SELECT 1');
    res.json({ status: 'ready', timestamp: new Date().toISOString() });
  } catch (error) {
    logger.error('Readiness check failed:', error);
    res.status(503).json({ 
      status: 'not ready', 
      timestamp: new Date().toISOString(),
      error: 'Database not available'
    });
  }
});

router.get('/live', (req, res) => {
  res.json({ 
    status: 'alive', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

export { router as healthRouter };