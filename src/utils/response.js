import { logger } from '../config/logger.js';

export class ResponseUtils {
  /**
   * Resposta de sucesso
   */
  static success(res, data = null, message = 'Success', statusCode = 200) {
    const response = {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString()
    };

    // Corrigir: usar res.status().json() ao invés de res.json(data, status)
    return res.status(statusCode).json(response);
  }

  /**
   * Resposta de erro
   */
  static error(res, message = 'Error', statusCode = 500, errors = null) {
    const response = {
      success: false,
      message,
      errors,
      timestamp: new Date().toISOString()
    };

    logger.error(`API Error: ${message}`, { statusCode, errors });

    // Corrigir: usar res.status().json() ao invés de res.json(data, status)
    return res.status(statusCode).json(response);
  }

  /**
   * Resposta de validação
   */
  static validation(res, errors, message = 'Dados inválidos') {
    return this.error(res, message, 400, errors);
  }

  /**
   * Resposta não encontrado
   */
  static notFound(res, message = 'Recurso não encontrado') {
    return this.error(res, message, 404);
  }

  /**
   * Resposta não autorizado
   */
  static unauthorized(res, message = 'Não autorizado') {
    return this.error(res, message, 401);
  }

  /**
   * Resposta proibido
   */
  static forbidden(res, message = 'Acesso negado') {
    return this.error(res, message, 403);
  }

  /**
   * Resposta de conflito
   */
  static conflict(res, message = 'Conflito de dados') {
    return this.error(res, message, 409);
  }

  /**
   * Resposta com paginação
   */
  static paginated(res, data, pagination, message = 'Success') {
    const response = {
      success: true,
      message,
      data,
      pagination,
      timestamp: new Date().toISOString()
    };

    return res.status(200).json(response);
  }
}

export default ResponseUtils;
