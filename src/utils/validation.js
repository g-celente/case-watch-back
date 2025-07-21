import { z } from 'zod';

export class ValidationUtils {
  static validateEmail(email) {
    const emailSchema = z.string().email();
    return emailSchema.safeParse(email);
  }

  static validateUUID(id) {
    const uuidSchema = z.string().uuid();
    return uuidSchema.safeParse(id);
  }

  static validatePagination(page, limit) {
    const paginationSchema = z.object({
      page: z.number().int().min(1).optional().default(1),
      limit: z.number().int().min(1).max(100).optional().default(10)
    });
    
    return paginationSchema.safeParse({ page, limit });
  }

  static validateDateRange(startDate, endDate) {
    const dateRangeSchema = z.object({
      startDate: z.string().datetime().optional(),
      endDate: z.string().datetime().optional()
    }).refine(data => {
      if (data.startDate && data.endDate) {
        return new Date(data.startDate) <= new Date(data.endDate);
      }
      return true;
    }, {
      message: 'Data de início deve ser anterior à data de fim'
    });

    return dateRangeSchema.safeParse({ startDate, endDate });
  }
}
