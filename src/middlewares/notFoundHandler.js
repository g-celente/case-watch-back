import { logger } from '../utils/logger.js';

export const notFoundHandler = (req, res) => {
  logger.warn(`404 - Not Found: ${req.method} ${req.originalUrl}`);
  
  res.status(404).json({
    error: 'Not Found',
    message: `The requested resource ${req.originalUrl} was not found`,
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
    method: req.method
  });
};
