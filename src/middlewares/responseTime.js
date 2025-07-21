import { logger } from '../utils/logger.js';

export const responseTime = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    
    // Log response time for monitoring
    if (duration > 1000) {
      logger.warn(`Slow response: ${req.method} ${req.originalUrl} - ${duration}ms`);
    }
  });
  
  next();
};
