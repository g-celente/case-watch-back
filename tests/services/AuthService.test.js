import { describe, it, expect, beforeEach, jest } from '@jest/globals';

// Mock correto das dependências ANTES dos imports
jest.unstable_mockModule('../../src/repositories/UserRepository.js', () => ({
  UserRepository: jest.fn().mockImplementation(() => ({
    findByEmail: jest.fn(),
    create: jest.fn(),
    findById: jest.fn(),
    getTasksCount: jest.fn(),
    update: jest.fn()
  }))
}));

jest.unstable_mockModule('../../src/utils/password.js', () => ({
  PasswordUtils: {
    hash: jest.fn(),
    compare: jest.fn(),
    validate: jest.fn()
  }
}));

jest.unstable_mockModule('../../src/utils/jwt.js', () => ({
  JwtUtils: {
    generateToken: jest.fn(),
    verifyToken: jest.fn()
  }
}));

// Mock do logger
jest.unstable_mockModule('../../src/config/logger.js', () => ({
  default: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn()
  }
}));

// Agora fazer os imports
const { AuthService } = await import('../../src/services/AuthService.js');
const { UserRepository } = await import('../../src/repositories/UserRepository.js');
const { PasswordUtils } = await import('../../src/utils/password.js');
const { JwtUtils } = await import('../../src/utils/jwt.js');

describe('AuthService', () => {
  let authService;
  let mockUserRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Configurar mocks
    mockUserRepository = new UserRepository();
    authService = new AuthService();
    
    // Substituir a instância do repository no service
    authService.userRepository = mockUserRepository;
  });

  describe('register', () => {
    it('deve registrar um novo usuário com sucesso', async () => {
      // Arrange
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'MyPass123!'
      };

      const mockUser = {
        id: 'cuid123',
        name: 'John Doe',
        email: 'john@example.com',
        createdAt: new Date(),
        updatedAt: new Date(),
        toJSON: () => ({
          id: 'cuid123',
          name: 'John Doe',
          email: 'john@example.com',
          createdAt: new Date(),
          updatedAt: new Date()
        })
      };

      mockUserRepository.findByEmail.mockResolvedValue(null);
      PasswordUtils.validate.mockReturnValue(true);
      PasswordUtils.hash.mockResolvedValue('hashedPassword123');
      mockUserRepository.create.mockResolvedValue(mockUser);
      JwtUtils.generateToken.mockReturnValue('jwt-token-123');

      // Act
      const result = await authService.register(userData);

      // Assert
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('john@example.com');
      expect(PasswordUtils.validate).toHaveBeenCalledWith('MyPass123!');
      expect(PasswordUtils.hash).toHaveBeenCalledWith('MyPass123!');
      expect(mockUserRepository.create).toHaveBeenCalledWith({
        email: 'john@example.com',
        name: 'John Doe',
        password: 'hashedPassword123'
      });
      expect(JwtUtils.generateToken).toHaveBeenCalledWith({
        userId: 'cuid123',
        email: 'john@example.com',
        name: 'John Doe'
      });

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('token', 'jwt-token-123');
      expect(result.error).toBeUndefined();
    });

    it('deve retornar erro se o email já existir', async () => {
      // Arrange
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'MyPass123!'
      };

      const existingUser = { id: 'existing-id' };
      mockUserRepository.findByEmail.mockResolvedValue(existingUser);

      // Act
      const result = await authService.register(userData);

      // Assert
      expect(result.error).toBe(true);
      expect(result.message).toBe('Email já cadastrado');
      expect(result.statusCode).toBe(400);
    });

    it('deve retornar erro se a senha for inválida', async () => {
      // Arrange
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'weak'
      };

      mockUserRepository.findByEmail.mockResolvedValue(null);
      PasswordUtils.validate.mockReturnValue(false);

      // Act
      const result = await authService.register(userData);

      // Assert
      expect(result.error).toBe(true);
      expect(result.message).toContain('Senha deve ter pelo menos 8 caracteres');
      expect(result.statusCode).toBe(400);
    });
  });

  describe('login', () => {
    it('deve fazer login com sucesso', async () => {
      // Arrange
      const credentials = {
        email: 'john@example.com',
        password: 'MyPass123!'
      };

      const mockUser = {
        id: 'cuid123',
        name: 'John Doe',
        email: 'john@example.com',
        password: 'hashedPassword123',
        toJSON: () => ({
          id: 'cuid123',
          name: 'John Doe',
          email: 'john@example.com'
        })
      };

      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      PasswordUtils.compare.mockResolvedValue(true);
      JwtUtils.generateToken.mockReturnValue('jwt-token-123');

      // Act
      const result = await authService.login(credentials);

      // Assert
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('john@example.com');
      expect(PasswordUtils.compare).toHaveBeenCalledWith('MyPass123!', 'hashedPassword123');
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('token', 'jwt-token-123');
      expect(result.error).toBeUndefined();
    });

    it('deve retornar erro se o usuário não existir', async () => {
      // Arrange
      const credentials = {
        email: 'nonexistent@example.com',
        password: 'MyPass123!'
      };

      mockUserRepository.findByEmail.mockResolvedValue(null);

      // Act
      const result = await authService.login(credentials);

      // Assert
      expect(result.error).toBe(true);
      expect(result.message).toBe('Email não encontrado no sistema');
      expect(result.statusCode).toBe(404);
    });

    it('deve retornar erro se a senha estiver incorreta', async () => {
      // Arrange
      const credentials = {
        email: 'john@example.com',
        password: 'wrongPassword'
      };

      const mockUser = {
        id: 'cuid123',
        password: 'hashedPassword123'
      };

      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      PasswordUtils.compare.mockResolvedValue(false);

      // Act
      const result = await authService.login(credentials);

      // Assert
      expect(result.error).toBe(true);
      expect(result.message).toBe('Senha do usuário incorreta');
      expect(result.statusCode).toBe(401);
    });
  });

  describe('getProfile', () => {
    it('deve retornar o perfil do usuário com sucesso', async () => {
      // Arrange
      const userId = 'cuid123';
      const mockUser = {
        id: 'cuid123',
        name: 'John Doe',
        email: 'john@example.com',
        toJSON: () => ({
          id: 'cuid123',
          name: 'John Doe',
          email: 'john@example.com'
        })
      };
      const mockTasksCount = {
        ownedTasks: 5,
        assignedTasks: 3,
        totalTasks: 8
      };

      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockUserRepository.getTasksCount.mockResolvedValue(mockTasksCount);

      // Act
      const result = await authService.getProfile(userId);

      // Assert
      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
      expect(mockUserRepository.getTasksCount).toHaveBeenCalledWith(userId);
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('stats', mockTasksCount);
    });

    it('deve lançar erro se o usuário não existir', async () => {
      // Arrange
      const userId = 'nonexistent-id';
      mockUserRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(authService.getProfile(userId)).rejects.toThrow('Usuário não encontrado');
    });
  });
});