import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import authRoutes from './auth.js';
import userRoutes from './users.js';
import categoryRoutes from './categories.js';
import taskRoutes from './tasks.js';
import reportRoutes from './reports.js';
import { logger } from '../utils/logger.js';

const router = Router();

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

// Rate limiting global
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: 900
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      error: 'Too many requests from this IP, please try again later.',
      retryAfter: 900
    });
  }
});

// Aplicar rate limiting global
router.use(globalLimiter);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0'
  });
});

// Endpoints de API
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/categories', categoryRoutes);
router.use('/tasks', taskRoutes);
router.use('/reports', reportRoutes);

// Endpoint para status da API
router.get('/status', (req, res) => {
  res.json({
    api: 'Case Watch Backend',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      categories: '/api/categories',
      tasks: '/api/tasks',
      reports: '/api/reports'
    }
  });
});

// Middleware para rotas não encontradas
router.use('*', (req, res) => {
  logger.warn(`Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    error: 'Route not found',
    message: `The endpoint ${req.method} ${req.originalUrl} does not exist`,
    availableEndpoints: [
      'GET /api/health',
      'GET /api/status',
      'POST /api/auth/register',
      'POST /api/auth/login',
      'GET /api/users',
      'GET /api/categories',
      'GET /api/tasks',
      'GET /api/reports/dashboard'
    ]
  });
});

export default router;
