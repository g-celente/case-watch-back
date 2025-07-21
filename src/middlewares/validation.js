import { z } from 'zod';
import { ResponseUtils } from '../utils/response.js';
import logger from '../config/logger.js';

export const validate = (schema) => {
  return (req, res, next) => {
    try {

      const { body, query, params } = req;
      
      // Valida os dados de acordo com o schema
      const validationResult = schema.safeParse({
        body,
        query,
        params
      });

      if (!validationResult.success) {
        const errors = validationResult.error.errors.map(error => ({
          field: error.path.join('.'),
          message: error.message,
          code: error.code
        }));

        logger.warn('Erro de validação', {
          errors,
          route: req.path,
          method: req.method
        });

        return ResponseUtils.validation(res, errors);
      }

      // Atualiza req com dados validados
      req.validatedData = validationResult.data;
      next();
    } catch (error) {
      logger.error('Erro no middleware de validação', {
        error: error.message,
        route: req.path
      });
      
      return ResponseUtils.error(res, 'Erro na validação dos dados', 500);
    }
  };
};

// Schemas de validação comuns
export const commonSchemas = {
  id: z.object({
    params: z.object({
      id: z.string().cuid('ID deve ser um CUID válido')
    })
  }),

  pagination: z.object({
    query: z.object({
      page: z.string().optional().transform(val => val ? parseInt(val) : 1),
      limit: z.string().optional().transform(val => val ? parseInt(val) : 10),
      search: z.string().optional(),
      sortBy: z.string().optional(),
      sortOrder: z.enum(['asc', 'desc']).optional().default('desc')
    })
  }),

  dateRange: z.object({
    query: z.object({
      startDate: z.string().datetime().optional(),
      endDate: z.string().datetime().optional()
    })
  })
};
