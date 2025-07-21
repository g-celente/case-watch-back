import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { JwtUtils } from '../../src/utils/jwt.js';
import { PasswordUtils } from '../../src/utils/password.js';
import { ValidationUtils } from '../../src/utils/validation.js';
import { PaginationUtils } from '../../src/utils/pagination.js';
import { ResponseUtils } from '../../src/utils/response.js';

// Mock das dependências
jest.mock('jsonwebtoken');
jest.mock('bcryptjs');

describe('Utils Tests - Simple', () => {
  describe('ValidationUtils', () => {
    it('validateEmail should validate email format', () => {
      // Valid emails
      expect(ValidationUtils.validateEmail('test@example.com').success).toBe(true);
      
      // Invalid emails
      expect(ValidationUtils.validateEmail('invalid-email').success).toBe(false);
    });

    it('validateUUID should validate UUID format', () => {
      // Valid UUIDs
      expect(ValidationUtils.validateUUID('550e8400-e29b-41d4-a716-446655440000').success).toBe(true);
      
      // Invalid UUIDs
      expect(ValidationUtils.validateUUID('invalid-uuid').success).toBe(false);
    });

    it('validatePagination should validate pagination params', () => {
      // Valid pagination
      expect(ValidationUtils.validatePagination(1, 10).success).toBe(true);
      
      // Invalid pagination  
      expect(ValidationUtils.validatePagination(0, 10).success).toBe(false);
    });
  });

  describe('PaginationUtils', () => {
    it('getPaginationData should calculate pagination correctly', () => {
      const result = PaginationUtils.getPaginationData(1, 10, 25);
      
      expect(result).toEqual({
        page: 1,
        limit: 10,
        skip: 0
      });
    });
  });
});
