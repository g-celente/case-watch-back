import logger from '../config/logger.js';
import { ResponseUtils } from '../utils/response.js';

export const errorHandler = (err, req, res, next) => {
  logger.error(err.message, {
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Erro de validação do Prisma
  if (err.code === 'P2002') {
    return ResponseUtils.conflict(res, 'Dados já existem no sistema');
  }

  // Erro de registro não encontrado no Prisma
  if (err.code === 'P2025') {
    return ResponseUtils.notFound(res, 'Registro não encontrado');
  }

  // Erro de validação do Zod
  if (err.name === 'ZodError') {
    const errors = err.errors.map(error => ({
      field: error.path.join('.'),
      message: error.message
    }));
    return ResponseUtils.validationError(res, errors);
  }

  // Erro de JWT
  if (err.name === 'JsonWebTokenError') {
    return ResponseUtils.unauthorized(res, 'Token inválido');
  }

  if (err.name === 'TokenExpiredError') {
    return ResponseUtils.unauthorized(res, 'Token expirado');
  }

  // Erro personalizado
  if (err.statusCode) {
    return ResponseUtils.error(res, err.message, err.statusCode);
  }

  // Erro genérico
  return ResponseUtils.error(res, 'Erro interno do servidor', 500);
};

export const notFoundHandler = (req, res) => {
  ResponseUtils.notFound(res, `Rota ${req.method} ${req.url} não encontrada`);
};
