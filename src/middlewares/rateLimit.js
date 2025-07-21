import rateLimit from 'express-rate-limit';
import config from '../config/index.js';
import { ResponseUtils } from '../utils/response.js';
import logger from '../config/logger.js';

// Rate limiting geral
export const generalRateLimit = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW_MS,
  max: config.RATE_LIMIT_MAX_REQUESTS,
  message: {
    success: false,
    message: 'Muitas requisições. Tente novamente mais tarde.',
    retryAfter: Math.ceil(config.RATE_LIMIT_WINDOW_MS / 1000)
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn('Rate limit excedido', {
      ip: req.ip,
      route: req.path,
      userAgent: req.get('User-Agent')
    });
    
    ResponseUtils.error(res, 'Muitas requisições. Tente novamente mais tarde.', 429);
  }
});

// Rate limiting para autenticação (mais restritivo)
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // máximo 5 tentativas de login por IP
  message: {
    success: false,
    message: 'Muitas tentativas de login. Tente novamente em 15 minutos.',
    retryAfter: 15 * 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  handler: (req, res) => {
    logger.warn('Rate limit de autenticação excedido', {
      ip: req.ip,
      route: req.path,
      userAgent: req.get('User-Agent')
    });
    
    ResponseUtils.error(res, 'Muitas tentativas de login. Tente novamente em 15 minutos.', 429);
  }
});

// Rate limiting para criação de recursos (moderado)
export const createResourceRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 20, // máximo 20 criações por minuto
  message: {
    success: false,
    message: 'Muitas criações de recursos. Tente novamente em 1 minuto.',
    retryAfter: 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn('Rate limit de criação excedido', {
      ip: req.ip,
      route: req.path,
      userAgent: req.get('User-Agent')
    });
    
    ResponseUtils.error(res, 'Muitas criações de recursos. Tente novamente em 1 minuto.', 429);
  }
});
