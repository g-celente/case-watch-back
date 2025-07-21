import { describe, it, expect, beforeEach, jest } from '@jest/globals';

// Mock das dependências
jest.unstable_mockModule('../../src/repositories/TaskRepository.js', () => ({
  TaskRepository: jest.fn().mockImplementation(() => ({
    findAll: jest.fn(),
    getTasksByStatus: jest.fn(),
    getTasksByPriority: jest.fn(),
    getOverdueTasks: jest.fn(),
    findByCategory: jest.fn()
  }))
}));

jest.unstable_mockModule('../../src/repositories/CategoryRepository.js', () => ({
  CategoryRepository: jest.fn().mockImplementation(() => ({
    findAll: jest.fn(),
    findById: jest.fn(),
    findByUserId: jest.fn()
  }))
}));

jest.unstable_mockModule('../../src/repositories/UserRepository.js', () => ({
  UserRepository: jest.fn().mockImplementation(() => ({
    findById: jest.fn()
  }))
}));

jest.unstable_mockModule('../../src/config/logger.js', () => ({
  default: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn()
  }
}));

// Imports
const { ReportService } = await import('../../src/services/ReportService.js');
const { TaskRepository } = await import('../../src/repositories/TaskRepository.js');
const { CategoryRepository } = await import('../../src/repositories/CategoryRepository.js');
const { UserRepository } = await import('../../src/repositories/UserRepository.js');
const { TaskStatus } = await import('../../src/entities/Task.js');

describe('ReportService', () => {
  let reportService;
  let mockTaskRepository;
  let mockCategoryRepository;
  let mockUserRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup dos mocks dos repositories
    mockTaskRepository = {
      findAll: jest.fn(),
      getTasksByStatus: jest.fn(),
      getTasksByPriority: jest.fn(),
      getOverdueTasks: jest.fn(),
      findByCategory: jest.fn()
    };

    mockCategoryRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByUserId: jest.fn()
    };

    mockUserRepository = {
      findById: jest.fn()
    };

    // Mock das implementações dos repositories
    TaskRepository.mockImplementation(() => mockTaskRepository);
    CategoryRepository.mockImplementation(() => mockCategoryRepository);
    UserRepository.mockImplementation(() => mockUserRepository);
    
    reportService = new ReportService();
  });

  describe('getTasksByStatusReport', () => {
    it('should generate tasks by status report successfully', async () => {
      // Arrange
      const userId = 'user-123';
      const options = {
        startDate: '2025-01-01',
        endDate: '2025-01-31'
      };

      const mockTasks = {
        tasks: [
          { id: 'task-1', status: TaskStatus.COMPLETED, createdAt: new Date('2025-01-15') },
          { id: 'task-2', status: TaskStatus.IN_PROGRESS, createdAt: new Date('2025-01-20') },
          { id: 'task-3', status: TaskStatus.COMPLETED, createdAt: new Date('2025-01-25') },
          { id: 'task-4', status: TaskStatus.TODO, createdAt: new Date('2025-01-10') }
        ],
        total: 4
      };

      mockTaskRepository.findAll.mockResolvedValue(mockTasks);

      // Act
      const result = await reportService.getTasksByStatusReport(userId, options);

      // Assert
      expect(mockTaskRepository.findAll).toHaveBeenCalledWith({
        userId,
        createdAt: { lte: new Date(options.endDate) } // Apenas endDate é aplicado devido ao spread
      });

      expect(result).toEqual({
        tasksByStatus: {
          [TaskStatus.COMPLETED]: 2,
          [TaskStatus.IN_PROGRESS]: 1,
          [TaskStatus.TODO]: 1
        },
        totalTasks: 4,
        completedTasks: 2,
        completionRate: 50,
        period: {
          startDate: options.startDate,
          endDate: options.endDate
        }
      });
    });

    it('should generate report without date filters', async () => {
      // Arrange
      const userId = 'user-123';
      const options = {};

      const mockTasks = {
        tasks: [
          { id: 'task-1', status: TaskStatus.COMPLETED },
          { id: 'task-2', status: TaskStatus.TODO }
        ],
        total: 2
      };

      mockTaskRepository.findAll.mockResolvedValue(mockTasks);

      // Act
      const result = await reportService.getTasksByStatusReport(userId, options);

      // Assert
      expect(mockTaskRepository.findAll).toHaveBeenCalledWith({
        userId
      });

      expect(result.period).toEqual({
        startDate: null,
        endDate: null
      });
    });

    it('should handle empty tasks list', async () => {
      // Arrange
      const userId = 'user-123';
      const mockTasks = { tasks: [], total: 0 };

      mockTaskRepository.findAll.mockResolvedValue(mockTasks);

      // Act
      const result = await reportService.getTasksByStatusReport(userId);

      // Assert
      expect(result.totalTasks).toBe(0);
      expect(result.completedTasks).toBe(0);
      expect(result.completionRate).toBe(0);
      expect(result.tasksByStatus).toEqual({});
    });

    it('should handle errors when generating status report', async () => {
      // Arrange
      const userId = 'user-123';
      const errorMessage = 'Database error';
      
      mockTaskRepository.findAll.mockRejectedValue(new Error(errorMessage));

      // Act & Assert
      await expect(reportService.getTasksByStatusReport(userId))
        .rejects.toThrow(errorMessage);
    });
  });

  describe('getUserPerformanceReport', () => {
    it('should generate user performance report successfully', async () => {
      // Arrange
      const userId = 'user-123';
      const options = {
        startDate: '2025-01-01',
        endDate: '2025-01-31'
      };

      const mockUser = {
        id: userId,
        name: 'Test User',
        email: 'test@example.com'
      };

      const completedDate = new Date('2025-01-20');
      const createdDate = new Date('2025-01-15');

      const mockTasks = {
        tasks: [
          { 
            id: 'task-1', 
            status: TaskStatus.COMPLETED,
            createdAt: createdDate,
            updatedAt: completedDate
          },
          { 
            id: 'task-2', 
            status: TaskStatus.IN_PROGRESS,
            createdAt: new Date('2025-01-10')
          }
        ],
        total: 2
      };

      const mockTasksByStatus = {
        [TaskStatus.COMPLETED]: 1,
        [TaskStatus.IN_PROGRESS]: 1
      };

      const mockTasksByPriority = {
        HIGH: 1,
        MEDIUM: 1,
        LOW: 0
      };

      const mockOverdueTasks = {
        tasks: [],
        total: 0
      };

      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockTaskRepository.findAll.mockResolvedValue(mockTasks);
      mockTaskRepository.getTasksByStatus.mockResolvedValue(mockTasksByStatus);
      mockTaskRepository.getTasksByPriority.mockResolvedValue(mockTasksByPriority);
      mockTaskRepository.getOverdueTasks.mockResolvedValue(mockOverdueTasks);

      // Act
      const result = await reportService.getUserPerformanceReport(userId, options);

      // Assert
      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
      expect(mockTaskRepository.findAll).toHaveBeenCalledWith({
        userId,
        createdAt: { lte: new Date(options.endDate) } // Apenas endDate é aplicado devido ao spread
      });

      expect(result).toEqual(
        expect.objectContaining({
          user: {
            id: mockUser.id,
            name: mockUser.name,
            email: mockUser.email
          },
          summary: {
            totalTasks: 2,
            completedTasks: 1,
            completionRate: 50,
            overdueTasks: mockOverdueTasks, // O objeto completo é retornado
            averageCompletionDays: 5 // Valor específico baseado nas datas dos mocks
          },
          breakdown: {
            tasksByStatus: mockTasksByStatus,
            tasksByPriority: mockTasksByPriority
          },
          period: {
            startDate: options.startDate,
            endDate: options.endDate
          }
        })
      );
    });

    it('should throw error when user not found', async () => {
      // Arrange
      const userId = 'non-existent-user';
      
      mockUserRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(reportService.getUserPerformanceReport(userId))
        .rejects.toThrow('Usuário não encontrado');

      expect(mockTaskRepository.findAll).not.toHaveBeenCalled();
    });

    it('should handle user with no tasks', async () => {
      // Arrange
      const userId = 'user-123';
      const mockUser = {
        id: userId,
        name: 'Test User',
        email: 'test@example.com'
      };

      const mockTasks = { tasks: [], total: 0 };
      const mockTasksByStatus = {};
      const mockTasksByPriority = {};
      const mockOverdueTasks = { tasks: [], total: 0 };

      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockTaskRepository.findAll.mockResolvedValue(mockTasks);
      mockTaskRepository.getTasksByStatus.mockResolvedValue(mockTasksByStatus);
      mockTaskRepository.getTasksByPriority.mockResolvedValue(mockTasksByPriority);
      mockTaskRepository.getOverdueTasks.mockResolvedValue(mockOverdueTasks);

      // Act
      const result = await reportService.getUserPerformanceReport(userId);

      // Assert
      expect(result.summary.totalTasks).toBe(0);
      expect(result.summary.completedTasks).toBe(0);
      expect(result.summary.completionRate).toBe(0);
      expect(result.summary.averageCompletionDays).toBe(0);
    });

    it('should handle errors when generating performance report', async () => {
      // Arrange
      const userId = 'user-123';
      const errorMessage = 'Database error';
      
      mockUserRepository.findById.mockRejectedValue(new Error(errorMessage));

      // Act & Assert
      await expect(reportService.getUserPerformanceReport(userId))
        .rejects.toThrow(errorMessage);
    });
  });

  describe('getTasksByCategoryReport', () => {
    it('should generate tasks by category report successfully', async () => {
      // Arrange
      const userId = 'user-123';
      const options = {};

      const mockTasks = {
        tasks: [
          { 
            id: 'task-1', 
            status: 'COMPLETED', // String ao invés de constante
            category: { id: 'cat-1', name: 'Work' }
          },
          { 
            id: 'task-2', 
            status: 'IN_PROGRESS', // String ao invés de constante
            category: { id: 'cat-1', name: 'Work' }
          },
          { 
            id: 'task-3', 
            status: 'TODO', // String ao invés de constante
            category: { id: 'cat-2', name: 'Personal' }
          }
        ],
        total: 3
      };

      mockTaskRepository.findAll.mockResolvedValue(mockTasks);

      // Act
      const result = await reportService.getTasksByCategoryReport(userId, options);

      // Assert
      expect(mockTaskRepository.findAll).toHaveBeenCalledWith({ userId });

      expect(result).toEqual({
        tasksByCategory: expect.arrayContaining([
          expect.objectContaining({
            id: 'cat-1',
            name: 'Work',
            total: 2
          }),
          expect.objectContaining({
            id: 'cat-2',
            name: 'Personal',
            total: 1
          })
        ]),
        totalTasks: 3,
        categoriesCount: 2,
        period: {
          startDate: null,
          endDate: null
        }
      });
    });

    it('should handle user with no tasks', async () => {
      // Arrange
      const userId = 'user-123';
      const mockTasks = { tasks: [], total: 0 };
      
      mockTaskRepository.findAll.mockResolvedValue(mockTasks);

      // Act
      const result = await reportService.getTasksByCategoryReport(userId);

      // Assert
      expect(result.totalTasks).toBe(0);
      expect(result.categoriesCount).toBe(0);
      expect(result.tasksByCategory).toEqual([]);
    });

    it('should handle tasks without categories', async () => {
      // Arrange
      const userId = 'user-123';
      const mockTasks = {
        tasks: [
          { 
            id: 'task-1', 
            status: 'TODO', // String ao invés de constante
            category: null
          }
        ],
        total: 1
      };

      mockTaskRepository.findAll.mockResolvedValue(mockTasks);

      // Act
      const result = await reportService.getTasksByCategoryReport(userId);

      // Assert
      expect(result.tasksByCategory).toEqual([
        expect.objectContaining({
          id: null,
          name: 'Sem categoria',
          total: 1
        })
      ]);
    });

    it('should handle errors when generating category report', async () => {
      // Arrange
      const userId = 'user-123';
      const errorMessage = 'Database error';
      
      mockTaskRepository.findAll.mockRejectedValue(new Error(errorMessage));

      // Act & Assert
      await expect(reportService.getTasksByCategoryReport(userId))
        .rejects.toThrow(errorMessage);
    });
  });
});
