import { describe, it, expect, beforeEach, jest } from '@jest/globals';

// Mock das dependências
jest.unstable_mockModule('../../src/repositories/TaskRepository.js', () => ({
  TaskRepository: jest.fn().mockImplementation(() => ({
    findAll: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    assignUser: jest.fn(),
    unassignUser: jest.fn(),
    addCollaborator: jest.fn(),
    removeCollaborator: jest.fn(),
    belongsToUser: jest.fn(),
    hasAccess: jest.fn()
  }))
}));

jest.unstable_mockModule('../../src/repositories/CategoryRepository.js', () => ({
  CategoryRepository: jest.fn().mockImplementation(() => ({
    findById: jest.fn(),
    existsById: jest.fn(), // Adicionado método que estava faltando
    belongsToUser: jest.fn()
  }))
}));

jest.unstable_mockModule('../../src/repositories/UserRepository.js', () => ({
  UserRepository: jest.fn().mockImplementation(() => ({
    existsById: jest.fn()
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
const { TaskService } = await import('../../src/services/TaskService.js');
const { TaskRepository } = await import('../../src/repositories/TaskRepository.js');
const { CategoryRepository } = await import('../../src/repositories/CategoryRepository.js');
const { UserRepository } = await import('../../src/repositories/UserRepository.js');
const { TaskStatus, Priority } = await import('../../src/entities/Task.js');

describe('TaskService', () => {
  let taskService;
  let mockTaskRepository;
  let mockCategoryRepository;
  let mockUserRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockTaskRepository = new TaskRepository();
    mockCategoryRepository = new CategoryRepository();
    mockUserRepository = new UserRepository();
    
    taskService = new TaskService();
    taskService.taskRepository = mockTaskRepository;
    taskService.categoryRepository = mockCategoryRepository;
    taskService.userRepository = mockUserRepository;
  });

  describe('createTask', () => {
    it('deve criar uma nova tarefa com sucesso', async () => {
      // Arrange
      const taskData = {
        title: 'Nova Tarefa',
        description: 'Descrição da tarefa',
        categoryId: 'category-123',
        priority: 'HIGH',
        dueDate: '2025-12-31T23:59:59.000Z',
        ownerId: 'user-123'
      };

      const mockCategory = {
        id: 'category-123',
        name: 'Categoria Test',
        userId: 'user-123'
      };

      const mockCreatedTask = {
        id: 'task-123',
        title: 'Nova Tarefa',
        description: 'Descrição da tarefa',
        status: TaskStatus.PENDING,
        priority: 'HIGH',
        categoryId: 'category-123',
        ownerId: 'user-123',
        dueDate: new Date('2025-12-31T23:59:59.000Z'), // Data futura
        createdAt: new Date(),
        updatedAt: new Date(),
        owner: { id: 'user-123', name: 'Test User' },
        category: mockCategory,
        assignees: [],
        collaborators: []
      };

      mockCategoryRepository.existsById.mockResolvedValue(true);
      mockCategoryRepository.belongsToUser.mockResolvedValue(true);
      mockTaskRepository.create.mockResolvedValue(mockCreatedTask);

      // Act
      const result = await taskService.createTask(taskData);

      // Assert
      expect(mockCategoryRepository.existsById).toHaveBeenCalledWith('category-123');
      expect(mockCategoryRepository.belongsToUser).toHaveBeenCalledWith('category-123', 'user-123');
      expect(mockTaskRepository.create).toHaveBeenCalledWith({
        title: 'Nova Tarefa',
        description: 'Descrição da tarefa',
        priority: 'HIGH',
        dueDate: new Date('2025-12-31T23:59:59.000Z'), // Data futura
        categoryId: 'category-123',
        ownerId: 'user-123'
      });
      expect(result).toEqual(mockCreatedTask);
    });

    it('deve lançar erro se a categoria não existir', async () => {
      // Arrange
      const taskData = {
        title: 'Nova Tarefa',
        categoryId: 'nonexistent-category',
        ownerId: 'user-123'
      };

      mockCategoryRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(taskService.createTask(taskData)).rejects.toThrow('Categoria não encontrada');
    });

    it('deve lançar erro se a categoria não pertencer ao usuário', async () => {
      // Arrange
      const taskData = {
        title: 'Nova Tarefa',
        categoryId: 'category-123',
        ownerId: 'user-123'
      };

      const mockCategory = {
        id: 'category-123',
        userId: 'other-user-456'
      };

      mockCategoryRepository.existsById.mockResolvedValue(true); // ADICIONAR
      mockCategoryRepository.findById.mockResolvedValue(mockCategory);
      mockCategoryRepository.belongsToUser.mockResolvedValue(false);

      // Act & Assert
      await expect(taskService.createTask(taskData)).rejects.toThrow('Categoria não pertence ao usuário');
    });
  });

  describe('getTasks', () => {
    it('deve retornar tarefas com paginação', async () => {
      // Arrange
      const options = {
        page: 1,
        limit: 10,
        userId: 'user-123',
        status: TaskStatus.PENDING
      };

      const mockTasks = [
        {
          id: 'task-1',
          title: 'Tarefa 1',
          status: TaskStatus.PENDING,
          ownerId: 'user-123'
        },
        {
          id: 'task-2',
          title: 'Tarefa 2',
          status: TaskStatus.PENDING,
          ownerId: 'user-123'
        }
      ];

      const mockResult = {
        tasks: mockTasks,
        total: 2
      };

      mockTaskRepository.findAll.mockResolvedValue(mockResult);

      // Act
      const result = await taskService.getTasks(options);

      // Assert
      expect(mockTaskRepository.findAll).toHaveBeenCalledWith(expect.objectContaining({
        page: 1,
        limit: 10,
        userId: 'user-123',
        status: TaskStatus.PENDING
      }));
      expect(result).toHaveProperty('tasks', mockTasks);
      expect(result).toHaveProperty('pagination');
    });
  });

  describe('updateTask', () => {
    it('deve atualizar uma tarefa com sucesso', async () => {
      // Arrange
      const taskId = 'task-123';
      const userId = 'user-123';
      const updateData = {
        title: 'Tarefa Atualizada',
        status: TaskStatus.COMPLETED
      };

      const existingTask = {
        id: 'task-123',
        title: 'Tarefa Original',
        status: TaskStatus.PENDING,
        ownerId: 'user-123'
      };

      const updatedTask = {
        ...existingTask,
        ...updateData,
        updatedAt: new Date()
      };

      mockTaskRepository.findById.mockResolvedValue(existingTask);
      mockTaskRepository.belongsToUser.mockResolvedValue(true);
      mockTaskRepository.update.mockResolvedValue(updatedTask);

      // Act
      const result = await taskService.updateTask(taskId, updateData, userId);

      // Assert
      expect(mockTaskRepository.findById).toHaveBeenCalledWith(taskId);
      expect(mockTaskRepository.belongsToUser).toHaveBeenCalledWith(taskId, userId);
      expect(mockTaskRepository.update).toHaveBeenCalledWith(taskId, updateData);
      expect(result).toEqual(updatedTask);
    });

    it('deve lançar erro se a tarefa não existir', async () => {
      // Arrange
      const taskId = 'nonexistent-task';
      const userId = 'user-123';
      const updateData = { title: 'Nova Título' };

      mockTaskRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(taskService.updateTask(taskId, updateData, userId)).rejects.toThrow('Tarefa não encontrada');
    });

    it('deve lançar erro se o usuário não for dono da tarefa', async () => {
      // Arrange
      const taskId = 'task-123';
      const userId = 'user-123';
      const updateData = { title: 'Nova Título' };

      const existingTask = {
        id: 'task-123',
        ownerId: 'other-user-456'
      };

      mockTaskRepository.findById.mockResolvedValue(existingTask);
      mockTaskRepository.belongsToUser.mockResolvedValue(false);

      // Act & Assert
      await expect(taskService.updateTask(taskId, updateData, userId)).rejects.toThrow('Você não tem permissão para editar esta tarefa');
    });
  });

  describe('deleteTask', () => {
    it('deve deletar uma tarefa com sucesso', async () => {
      // Arrange
      const taskId = 'task-123';
      const userId = 'user-123';

      const existingTask = {
        id: 'task-123',
        ownerId: 'user-123'
      };

      mockTaskRepository.findById.mockResolvedValue(existingTask);
      mockTaskRepository.belongsToUser.mockResolvedValue(true);
      mockTaskRepository.delete.mockResolvedValue(true);

      // Act
      const result = await taskService.deleteTask(taskId, userId);

      // Assert
      expect(mockTaskRepository.findById).toHaveBeenCalledWith(taskId);
      expect(mockTaskRepository.belongsToUser).toHaveBeenCalledWith(taskId, userId);
      expect(mockTaskRepository.delete).toHaveBeenCalledWith(taskId);
      expect(result).toBe(true);
    });

    it('deve lançar erro se a tarefa não existir', async () => {
      // Arrange
      const taskId = 'nonexistent-task';
      const userId = 'user-123';

      mockTaskRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(taskService.deleteTask(taskId, userId)).rejects.toThrow('Tarefa não encontrada');
    });
  });

  describe('assignTask', () => {
    it('deve atribuir tarefa para outro usuário com sucesso', async () => {
      // Arrange
      const taskId = 'task-123';
      const assigneeId = 'assignee-456';
      const userId = 'user-123';

      const existingTask = { id: 'task-123', ownerId: 'user-123' };
      const assignedUser = { id: 'assignee-456', name: 'Assignee User' };

      mockTaskRepository.findById.mockResolvedValue(existingTask);
      mockTaskRepository.belongsToUser.mockResolvedValue(true);
      mockUserRepository.existsById.mockResolvedValue(true);
      mockTaskRepository.assignUser.mockResolvedValue(assignedUser);

      // Act
      const result = await taskService.assignTask(taskId, assigneeId, userId);

      // Assert
      expect(mockTaskRepository.findById).toHaveBeenCalledWith(taskId);
      expect(mockTaskRepository.belongsToUser).toHaveBeenCalledWith(taskId, userId);
      expect(mockUserRepository.existsById).toHaveBeenCalledWith(assigneeId);
      expect(mockTaskRepository.assignUser).toHaveBeenCalledWith(taskId, assigneeId);
      expect(result).toEqual(assignedUser);
    });

    it('deve lançar erro se o usuário a ser atribuído não existir', async () => {
      // Arrange
      const taskId = 'task-123';
      const assigneeId = 'nonexistent-user';
      const userId = 'user-123';

      const existingTask = { id: 'task-123', ownerId: 'user-123' };

      mockTaskRepository.findById.mockResolvedValue(existingTask);
      mockTaskRepository.belongsToUser.mockResolvedValue(true);
      mockUserRepository.existsById.mockResolvedValue(false);

      // Act & Assert
      await expect(taskService.assignTask(taskId, assigneeId, userId)).rejects.toThrow('Usuário não encontrado');
    });
  });
});