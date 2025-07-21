import { describe, it, expect } from '@jest/globals';
import { PaginationUtils } from '../../src/utils/pagination.js';
import { ValidationUtils } from '../../src/utils/validation.js';

describe('Core Utils Tests', () => {
  describe('PaginationUtils', () => {
    it('should calculate pagination data correctly', () => {
      const result = PaginationUtils.getPaginationData(1, 10);
      
      expect(result).toEqual({
        page: 1,
        limit: 10,
        skip: 0
      });
    });

    it('should handle invalid parameters gracefully', () => {
      const result = PaginationUtils.getPaginationData(0, -5);
      
      expect(result.page).toBeGreaterThan(0);
      expect(result.limit).toBeGreaterThan(0);
      expect(result.skip).toBeGreaterThanOrEqual(0);
    });
  });

  describe('ValidationUtils', () => {
    it('should validate email correctly', () => {
      const validEmail = ValidationUtils.validateEmail('test@example.com');
      const invalidEmail = ValidationUtils.validateEmail('invalid-email');
      
      expect(validEmail.success).toBe(true);
      expect(invalidEmail.success).toBe(false);
    });

    it('should validate UUID correctly', () => {
      const validUUID = ValidationUtils.validateUUID('123e4567-e89b-12d3-a456-426614174000');
      const invalidUUID = ValidationUtils.validateUUID('invalid-uuid');
      
      expect(validUUID.success).toBe(true);
      expect(invalidUUID.success).toBe(false);
    });
  });
});
