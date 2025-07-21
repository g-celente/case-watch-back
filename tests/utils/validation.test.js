import { describe, it, expect } from '@jest/globals';
import { ValidationUtils } from '../../src/utils/validation.js';

describe('ValidationUtils', () => {
  describe('validateEmail', () => {
    it('should validate correct email addresses', () => {
      const result = ValidationUtils.validateEmail('test@example.com');
      expect(result.success).toBe(true);
    });

    it('should reject invalid email addresses', () => {
      const result = ValidationUtils.validateEmail('invalid-email');
      expect(result.success).toBe(false);
    });
  });

  describe('validateUUID', () => {
    it('should validate correct UUID format', () => {
      const result = ValidationUtils.validateUUID('123e4567-e89b-12d3-a456-426614174000');
      expect(result.success).toBe(true);
    });

    it('should reject invalid UUID format', () => {
      const result = ValidationUtils.validateUUID('invalid-uuid');
      expect(result.success).toBe(false);
    });
  });

  describe('validatePagination', () => {
    it('should validate correct pagination parameters', () => {
      const result = ValidationUtils.validatePagination(1, 10);
      expect(result.success).toBe(true);
    });

    it('should reject invalid pagination parameters', () => {
      const result = ValidationUtils.validatePagination(0, 10);
      expect(result.success).toBe(false);
    });
  });
});
