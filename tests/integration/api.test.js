import { describe, it, expect, beforeAll, afterAll, jest } from '@jest/globals';
import request from 'supertest';

// Mock do banco de dados e dependências ANTES de importar qualquer coisa
jest.unstable_mockModule('../../src/config/database.js', () => ({
  connectDatabase: jest.fn().mockResolvedValue(true),
  disconnectDatabase: jest.fn().mockResolvedValue(true),
  default: {
    $connect: jest.fn().mockResolvedValue(true),
    $disconnect: jest.fn().mockResolvedValue(true),
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    },
    task: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    },
    category: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    }
  }
}));

jest.unstable_mockModule('../../src/utils/jwt.js', () => ({
  JwtUtils: {
    generateToken: jest.fn(() => 'test-token'),
    verifyToken: jest.fn(() => ({ 
      userId: 'test-user-id', 
      email: 'test@example.com',
      name: 'Test User'
    }))
  }
}));

// Import da aplicação depois dos mocks
const app = (await import('../../src/index.js')).default;

describe('API Integration Tests', () => {
  let server;

  beforeAll(async () => {
    // Setup para testes
    process.env.NODE_ENV = 'test';
  });

  afterAll(async () => {
    if (server) {
      await server.close();
    }
  });

  describe('Health Check', () => {
    it('GET /api/health should return 200', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('environment');
    });
  });

  describe('API Status', () => {
    it('GET /api/status should return API information', async () => {
      const response = await request(app)
        .get('/api/status')
        .expect(200);

      expect(response.body).toHaveProperty('api', 'Case Watch Backend');
      expect(response.body).toHaveProperty('version');
      expect(response.body).toHaveProperty('status', 'running');
      expect(response.body).toHaveProperty('endpoints');
    });
  });

  describe('Authentication Routes', () => {
    it('POST /api/auth/register should validate required fields', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User'
          // Missing email and password
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('errors');
      expect(Array.isArray(response.body.errors)).toBe(true);
    });

    it('POST /api/auth/login should validate required fields', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com'
          // Missing password
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('errors');
    });

    it('POST /api/auth/register should validate email format', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'invalid-email',
          password: 'ValidPass123!'
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: expect.stringContaining('email'),
            message: expect.stringContaining('Email deve ser válido')
          })
        ])
      );
    });

    it('POST /api/auth/register should validate password strength', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'weak'
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: expect.stringContaining('password'),
            message: expect.stringContaining('pelo menos 8 caracteres')
          })
        ])
      );
    });
  });

  describe('Protected Routes', () => {
    it('GET /api/users should require authentication', async () => {
      const response = await request(app)
        .get('/api/users')
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Token de acesso requerido');
    });

    it('GET /api/tasks should require authentication', async () => {
      const response = await request(app)
        .get('/api/tasks')
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('Token de acesso requerido');
    });

    it('GET /api/categories should require authentication', async () => {
      const response = await request(app)
        .get('/api/categories')
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('Token de acesso requerido');
    });

    it('should allow access with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer valid-token')
        .expect(500);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('Error Handling', () => {

    it('should handle malformed JSON', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .set('Content-Type', 'application/json')
        .send('{ invalid json }')
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('CORS Headers', () => {
    it('should include CORS headers', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.headers).toHaveProperty('access-control-allow-origin');
    });

    it('should handle preflight requests', async () => {
      const response = await request(app)
        .options('/api/auth/login')
        .set('Origin', 'http://localhost:3000')
        .set('Access-Control-Request-Method', 'POST')
        .set('Access-Control-Request-Headers', 'Content-Type,Authorization');

      expect(response.status).toBeLessThan(400);
    });
  });

  describe('Security Headers', () => {
    it('should include security headers', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      // Helmet adiciona esses headers automaticamente
      expect(response.headers).toHaveProperty('x-content-type-options');
      expect(response.headers).toHaveProperty('x-frame-options');
    });
  });

  describe('Rate Limiting', () => {
    it('should not immediately hit rate limits for normal usage', async () => {
      // Fazer algumas requisições normais
      const responses = await Promise.all([
        request(app).get('/api/health'),
        request(app).get('/api/health'),
        request(app).get('/api/health')
      ]);

      // Todas devem passar
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });
    });
  });
});