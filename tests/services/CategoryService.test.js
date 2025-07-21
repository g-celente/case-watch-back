import { describe, it, expect, beforeEach, jest } from '@jest/globals';

// Mock das dependências
jest.unstable_mockModule('../../src/repositories/CategoryRepository.js', () => ({
  CategoryRepository: jest.fn().mockImplementation(() => ({
    findAll: jest.fn(),
    findById: jest.fn(),
    findByUserId: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    existsByName: jest.fn(),
    belongsToUser: jest.fn(),
    existsById: jest.fn()
  }))
}));

jest.unstable_mockModule('../../src/utils/pagination.js', () => ({
  PaginationUtils: {
    getPaginationData: jest.fn(),
    getPaginationInfo: jest.fn()
  }
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
const { CategoryService } = await import('../../src/services/CategoryService.js');
const { CategoryRepository } = await import('../../src/repositories/CategoryRepository.js');
const { PaginationUtils } = await import('../../src/utils/pagination.js');

describe('CategoryService', () => {
  let categoryService;
  let mockCategoryRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup do mock do repository
    mockCategoryRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByUserId: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      existsByName: jest.fn(),
      belongsToUser: jest.fn(),
      existsById: jest.fn()
    };

    // Mock da implementação do CategoryRepository
    CategoryRepository.mockImplementation(() => mockCategoryRepository);
    
    categoryService = new CategoryService();

    // Setup dos mocks do PaginationUtils
    PaginationUtils.getPaginationData.mockReturnValue({
      page: 1,
      limit: 10,
      skip: 0
    });
    
    PaginationUtils.getPaginationInfo.mockReturnValue({
      currentPage: 1,
      totalPages: 1,
      hasNext: false,
      hasPrev: false,
      totalItems: 1
    });
  });

  describe('getCategories', () => {
    it('should return paginated categories successfully', async () => {
      // Arrange
      const mockOptions = { page: 1, limit: 10, userId: 'user-123' };
      const mockResult = {
        categories: [
          { 
            id: 'cat-1', 
            name: 'Work', 
            description: 'Work related tasks',
            color: '#FF0000',
            userId: 'user-123'
          }
        ],
        total: 1
      };

      mockCategoryRepository.findAll.mockResolvedValue(mockResult);

      // Act
      const result = await categoryService.getCategories(mockOptions);

      // Assert
      expect(mockCategoryRepository.findAll).toHaveBeenCalledWith({
        ...mockOptions,
        page: 1,
        limit: 10,
        skip: 0
      });
      expect(result.categories).toEqual(mockResult.categories);
      expect(result.pagination).toBeDefined();
    });

    it('should handle errors when getting categories', async () => {
      // Arrange
      const mockOptions = { userId: 'user-123' };
      const errorMessage = 'Database error';
      
      mockCategoryRepository.findAll.mockRejectedValue(new Error(errorMessage));

      // Act & Assert
      await expect(categoryService.getCategories(mockOptions))
        .rejects.toThrow(errorMessage);
    });
  });

  describe('getCategoryById', () => {
    it('should return category when found', async () => {
      // Arrange
      const categoryId = 'cat-123';
      const mockCategory = {
        id: categoryId,
        name: 'Personal',
        description: 'Personal tasks',
        color: '#00FF00',
        userId: 'user-123'
      };

      mockCategoryRepository.findById.mockResolvedValue(mockCategory);

      // Act
      const result = await categoryService.getCategoryById(categoryId);

      // Assert
      expect(mockCategoryRepository.findById).toHaveBeenCalledWith(categoryId);
      expect(result).toEqual(mockCategory);
    });

    it('should throw error when category not found', async () => {
      // Arrange
      const categoryId = 'non-existent';
      
      mockCategoryRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(categoryService.getCategoryById(categoryId))
        .rejects.toThrow('Categoria não encontrada');
    });
  });

  describe('getUserCategories', () => {
    it('should return user categories successfully', async () => {
      // Arrange
      const userId = 'user-123';
      const mockOptions = { sortBy: 'name' };
      const mockCategories = [
        { id: 'cat-1', name: 'Work', userId },
        { id: 'cat-2', name: 'Personal', userId }
      ];

      mockCategoryRepository.findByUserId.mockResolvedValue(mockCategories);

      // Act
      const result = await categoryService.getUserCategories(userId, mockOptions);

      // Assert
      expect(mockCategoryRepository.findByUserId).toHaveBeenCalledWith(userId, mockOptions);
      expect(result).toEqual(mockCategories);
    });

    it('should handle errors when getting user categories', async () => {
      // Arrange
      const userId = 'user-123';
      const errorMessage = 'Database error';
      
      mockCategoryRepository.findByUserId.mockRejectedValue(new Error(errorMessage));

      // Act & Assert
      await expect(categoryService.getUserCategories(userId))
        .rejects.toThrow(errorMessage);
    });
  });

  describe('createCategory', () => {
    it('should create category successfully', async () => {
      // Arrange
      const categoryData = {
        name: 'New Category',
        description: 'A new category',
        color: '#FF0000',
        userId: 'user-123'
      };

      const mockCreatedCategory = {
        id: 'new-cat-id',
        ...categoryData,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockCategoryRepository.existsByName.mockResolvedValue(false);
      mockCategoryRepository.create.mockResolvedValue(mockCreatedCategory);

      // Act
      const result = await categoryService.createCategory(categoryData);

      // Assert
      expect(mockCategoryRepository.existsByName).toHaveBeenCalledWith(
        categoryData.name, 
        categoryData.userId
      );
      expect(mockCategoryRepository.create).toHaveBeenCalledWith(categoryData);
      expect(result).toEqual(mockCreatedCategory);
    });

    it('should throw error when category name already exists for user', async () => {
      // Arrange
      const categoryData = {
        name: 'Existing Category',
        userId: 'user-123'
      };

      mockCategoryRepository.existsByName.mockResolvedValue(true);

      // Act & Assert
      await expect(categoryService.createCategory(categoryData))
        .rejects.toThrow('Já existe uma categoria com este nome');

      expect(mockCategoryRepository.create).not.toHaveBeenCalled();
    });

    it('should throw error for invalid color format', async () => {
      // Arrange
      const categoryData = {
        name: 'Test Category',
        color: 'invalid-color',
        userId: 'user-123'
      };

      mockCategoryRepository.existsByName.mockResolvedValue(false);

      // Act & Assert
      await expect(categoryService.createCategory(categoryData))
        .rejects.toThrow('Cor deve estar no formato hexadecimal (#FFFFFF)');

      expect(mockCategoryRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('updateCategory', () => {
    it('should update category successfully', async () => {
      // Arrange
      const categoryId = 'cat-123';
      const userId = 'user-123';
      const updateData = {
        name: 'Updated Category',
        description: 'Updated description',
        color: '#00FF00'
      };

      const existingCategory = {
        id: categoryId,
        name: 'Old Category',
        description: 'Old description',
        color: '#FF0000',
        userId
      };

      const updatedCategory = {
        ...existingCategory,
        ...updateData,
        updatedAt: new Date()
      };

      mockCategoryRepository.findById.mockResolvedValue(existingCategory);
      mockCategoryRepository.belongsToUser.mockResolvedValue(true);
      mockCategoryRepository.existsByName.mockResolvedValue(false);
      mockCategoryRepository.update.mockResolvedValue(updatedCategory);

      // Act
      const result = await categoryService.updateCategory(categoryId, updateData, userId);

      // Assert
      expect(mockCategoryRepository.findById).toHaveBeenCalledWith(categoryId);
      expect(mockCategoryRepository.belongsToUser).toHaveBeenCalledWith(categoryId, userId);
      expect(mockCategoryRepository.existsByName).toHaveBeenCalledWith(
        updateData.name, 
        userId, 
        categoryId
      );
      expect(mockCategoryRepository.update).toHaveBeenCalledWith(categoryId, updateData);
      expect(result).toEqual(updatedCategory);
    });

    it('should throw error when category not found', async () => {
      // Arrange
      const categoryId = 'non-existent';
      const userId = 'user-123';
      const updateData = { name: 'Updated Category' };

      mockCategoryRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(categoryService.updateCategory(categoryId, updateData, userId))
        .rejects.toThrow('Categoria não encontrada');

      expect(mockCategoryRepository.belongsToUser).not.toHaveBeenCalled();
      expect(mockCategoryRepository.update).not.toHaveBeenCalled();
    });

    it('should throw error when user does not own category', async () => {
      // Arrange
      const categoryId = 'cat-123';
      const userId = 'user-123';
      const updateData = { name: 'Updated Category' };

      const existingCategory = {
        id: categoryId,
        name: 'Old Category',
        userId: 'other-user'
      };

      mockCategoryRepository.findById.mockResolvedValue(existingCategory);
      mockCategoryRepository.belongsToUser.mockResolvedValue(false);

      // Act & Assert
      await expect(categoryService.updateCategory(categoryId, updateData, userId))
        .rejects.toThrow('Você não tem permissão para editar esta categoria');

      expect(mockCategoryRepository.update).not.toHaveBeenCalled();
    });

    it('should throw error when new name already exists for user', async () => {
      // Arrange
      const categoryId = 'cat-123';
      const userId = 'user-123';
      const updateData = { name: 'Existing Category' };

      const existingCategory = {
        id: categoryId,
        name: 'Old Category',
        userId
      };

      mockCategoryRepository.findById.mockResolvedValue(existingCategory);
      mockCategoryRepository.belongsToUser.mockResolvedValue(true);
      mockCategoryRepository.existsByName.mockResolvedValue(true);

      // Act & Assert
      await expect(categoryService.updateCategory(categoryId, updateData, userId))
        .rejects.toThrow('Já existe uma categoria com este nome');

      expect(mockCategoryRepository.update).not.toHaveBeenCalled();
    });

    it('should throw error for invalid color format', async () => {
      // Arrange
      const categoryId = 'cat-123';
      const userId = 'user-123';
      const updateData = { color: 'invalid-color' };

      const existingCategory = {
        id: categoryId,
        name: 'Category',
        userId
      };

      mockCategoryRepository.findById.mockResolvedValue(existingCategory);
      mockCategoryRepository.belongsToUser.mockResolvedValue(true);

      // Act & Assert
      await expect(categoryService.updateCategory(categoryId, updateData, userId))
        .rejects.toThrow('Cor deve estar no formato hexadecimal (#FFFFFF)');

      expect(mockCategoryRepository.update).not.toHaveBeenCalled();
    });
  });
});
