import { CategoryRepository } from '../repositories/CategoryRepository.js';
import { PaginationUtils } from '../utils/pagination.js';
import logger from '../config/logger.js';

export class CategoryService {
  constructor() {
    this.categoryRepository = new CategoryRepository();
  }

  async getCategories(options = {}) {
    try {
      const { page, limit, skip } = PaginationUtils.getPaginationData(options.page, options.limit);
      
      const result = await this.categoryRepository.findAll({
        ...options,
        page,
        limit,
        skip
      });

      const pagination = PaginationUtils.getPaginationInfo(page, limit, result.total);

      logger.info('Categorias listadas', { 
        total: result.total, 
        page, 
        limit,
        userId: options.userId
      });

      return {
        categories: result.categories,
        pagination
      };
    } catch (error) {
      logger.error('Erro ao listar categorias', { error: error.message, options });
      throw error;
    }
  }

  async getCategoryById(id) {
    try {
      const category = await this.categoryRepository.findById(id);
      if (!category) {
        throw new Error('Categoria não encontrada');
      }

      return category;
    } catch (error) {
      logger.error('Erro ao buscar categoria', { error: error.message, id });
      throw error;
    }
  }

  async getUserCategories(userId, options = {}) {
    try {
      const categories = await this.categoryRepository.findByUserId(userId, options);

      logger.info('Categorias do usuário listadas', { 
        userId, 
        total: categories.length 
      });

      return categories;
    } catch (error) {
      logger.error('Erro ao listar categorias do usuário', { 
        error: error.message, 
        userId, 
        options 
      });
      throw error;
    }
  }

  async createCategory(categoryData) {
    try {
      const { name, description, color, userId } = categoryData;

      // Verifica se já existe uma categoria com o mesmo nome para o usuário
      const existingCategory = await this.categoryRepository.existsByName(name, userId);
      if (existingCategory) {
        throw new Error('Já existe uma categoria com este nome');
      }

      // Valida cor se fornecida
      if (color && !this.isValidColor(color)) {
        throw new Error('Cor deve estar no formato hexadecimal (#FFFFFF)');
      }

      const category = await this.categoryRepository.create({
        name,
        description,
        color,
        userId
      });

      logger.info('Categoria criada', { 
        categoryId: category.id, 
        name: category.name, 
        userId 
      });

      return category;
    } catch (error) {
      logger.error('Erro ao criar categoria', { error: error.message, categoryData });
      throw error;
    }
  }

  async updateCategory(id, updateData, userId) {
    try {
      const { name, description, color } = updateData;

      // Verifica se a categoria existe e pertence ao usuário
      const existingCategory = await this.categoryRepository.findById(id);
      if (!existingCategory) {
        throw new Error('Categoria não encontrada');
      }

      const belongsToUser = await this.categoryRepository.belongsToUser(id, userId);
      if (!belongsToUser) {
        throw new Error('Você não tem permissão para editar esta categoria');
      }

      // Verifica se o nome já está em uso por outra categoria do usuário
      if (name && name !== existingCategory.name) {
        const nameExists = await this.categoryRepository.existsByName(name, userId, id);
        if (nameExists) {
          throw new Error('Já existe uma categoria com este nome');
        }
      }

      // Valida cor se fornecida
      if (color && !this.isValidColor(color)) {
        throw new Error('Cor deve estar no formato hexadecimal (#FFFFFF)');
      }

      const dataToUpdate = {};
      if (name) dataToUpdate.name = name;
      if (description !== undefined) dataToUpdate.description = description;
      if (color !== undefined) dataToUpdate.color = color;

      const updatedCategory = await this.categoryRepository.update(id, dataToUpdate);

      logger.info('Categoria atualizada', { categoryId: id, userId });

      return updatedCategory;
    } catch (error) {
      logger.error('Erro ao atualizar categoria', { 
        error: error.message, 
        id, 
        updateData, 
        userId 
      });
      throw error;
    }
  }

  async deleteCategory(id, userId) {
    try {
      // Verifica se a categoria existe e pertence ao usuário
      const existingCategory = await this.categoryRepository.findById(id);
      if (!existingCategory) {
        throw new Error('Categoria não encontrada');
      }

      const belongsToUser = await this.categoryRepository.belongsToUser(id, userId);
      if (!belongsToUser) {
        throw new Error('Você não tem permissão para deletar esta categoria');
      }

      // Verifica se há tarefas associadas
      const tasksCount = await this.categoryRepository.getTasksCount(id);
      if (tasksCount > 0) {
        throw new Error('Não é possível deletar categoria com tarefas associadas');
      }

      await this.categoryRepository.delete(id);

      logger.info('Categoria deletada', { categoryId: id, userId });

      return true;
    } catch (error) {
      logger.error('Erro ao deletar categoria', { error: error.message, id, userId });
      throw error;
    }
  }

  async getCategoryStats(id, userId) {
    try {
      // Verifica se a categoria existe e pertence ao usuário
      const category = await this.categoryRepository.findById(id);
      if (!category) {
        throw new Error('Categoria não encontrada');
      }

      const belongsToUser = await this.categoryRepository.belongsToUser(id, userId);
      if (!belongsToUser) {
        throw new Error('Você não tem permissão para visualizar esta categoria');
      }

      const tasksByStatus = await this.categoryRepository.getTasksByStatus(id);
      const totalTasks = await this.categoryRepository.getTasksCount(id);

      return {
        category: category.toJSON(),
        stats: {
          totalTasks,
          tasksByStatus
        }
      };
    } catch (error) {
      logger.error('Erro ao buscar estatísticas da categoria', { 
        error: error.message, 
        id, 
        userId 
      });
      throw error;
    }
  }

  async searchCategories(query, userId, options = {}) {
    try {
      const { page, limit, skip } = PaginationUtils.getPaginationData(options.page, options.limit);
      
      const result = await this.categoryRepository.findAll({
        search: query,
        userId,
        page,
        limit,
        skip,
        sortBy: options.sortBy,
        sortOrder: options.sortOrder
      });

      const pagination = PaginationUtils.getPaginationInfo(page, limit, result.total);

      logger.info('Busca de categorias realizada', { 
        query, 
        userId, 
        total: result.total, 
        page, 
        limit 
      });

      return {
        categories: result.categories,
        pagination,
        query
      };
    } catch (error) {
      logger.error('Erro na busca de categorias', { 
        error: error.message, 
        query, 
        userId, 
        options 
      });
      throw error;
    }
  }

  isValidColor(color) {
    const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    return hexColorRegex.test(color);
  }

  async checkCategoryExists(id) {
    try {
      return await this.categoryRepository.existsById(id);
    } catch (error) {
      logger.error('Erro ao verificar existência da categoria', { error: error.message, id });
      throw error;
    }
  }

  async checkCategoryBelongsToUser(categoryId, userId) {
    try {
      return await this.categoryRepository.belongsToUser(categoryId, userId);
    } catch (error) {
      logger.error('Erro ao verificar propriedade da categoria', { 
        error: error.message, 
        categoryId, 
        userId 
      });
      throw error;
    }
  }
}
