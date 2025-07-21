import { JwtUtils } from '../utils/jwt.js';
import { ResponseUtils } from '../utils/response.js';
import logger from '../config/logger.js';

export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return ResponseUtils.unauthorized(res, 'Token de acesso requerido');
    }

    const token = authHeader.substring(7);
    
    if (!token) {
      return ResponseUtils.unauthorized(res, 'Token de acesso requerido');
    }

    const decoded = JwtUtils.verifyToken(token);
    
    if (!decoded || !decoded.userId) {
      return ResponseUtils.unauthorized(res, 'Token inválido');
    }

    req.user = {
      id: decoded.userId,
      email: decoded.email,
      name: decoded.name
    };

    logger.debug(`Usuário autenticado: ${decoded.email}`, {
      userId: decoded.userId,
      route: req.path
    });

    next();
  } catch (error) {
    logger.error('Erro na autenticação', {
      error: error.message,
      route: req.path
    });
    
    return ResponseUtils.unauthorized(res, 'Token inválido ou expirado');
  }
};

export const optionalAuthMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      
      if (token) {
        const decoded = JwtUtils.verifyToken(token);
        
        if (decoded && decoded.userId) {
          req.user = {
            id: decoded.userId,
            email: decoded.email,
            name: decoded.name
          };
        }
      }
    }
    
    next();
  } catch (error) {
    // Em autenticação opcional, erros não impedem a execução
    logger.debug('Erro na autenticação opcional', {
      error: error.message,
      route: req.path
    });
    next();
  }
};
