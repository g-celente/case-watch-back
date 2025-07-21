import { CategoryService } from '../services/CategoryService.js';
import { ResponseUtils } from '../utils/response.js';
import logger from '../config/logger.js';

export class CategoryController {
  constructor() {
    this.categoryService = new CategoryService();
  }

  async getCategories(req, res, next) {
    try {
      const { page, limit, search, sortBy, sortOrder } = req.validatedData.query;
      const userId = req.user.id;

      const result = await this.categoryService.getCategories({
        page,
        limit,
        search,
        sortBy,
        sortOrder,
        userId
      });

      ResponseUtils.paginated(res, result.categories, result.pagination, 'Categorias recuperadas com sucesso');
    } catch (error) {
      logger.error('Erro ao listar categorias', { 
        error: error.message, 
        userId: req.user.id,
        query: req.validatedData.query 
      });
      next(error);
    }
  }

  async getCategoryById(req, res, next) {
    try {
      const { id } = req.validatedData.params;
      const userId = req.user.id;

      const category = await this.categoryService.getCategoryById(id);

      // Verifica se a categoria pertence ao usuário
      const belongsToUser = await this.categoryService.checkCategoryBelongsToUser(id, userId);
      if (!belongsToUser) {
        return ResponseUtils.forbidden(res, 'Você não tem permissão para visualizar esta categoria');
      }

      ResponseUtils.success(res, category, 'Categoria recuperada com sucesso');
    } catch (error) {
      logger.error('Erro ao buscar categoria', { 
        error: error.message, 
        id: req.validatedData.params.id,
        userId: req.user.id
      });
      next(error);
    }
  }

  async createCategory(req, res, next) {
    try {
      const { name, description, color } = req.validatedData.body;
      const userId = req.user.id;

      const category = await this.categoryService.createCategory({
        name,
        description,
        color,
        userId
      });

      logger.info('Categoria criada com sucesso', { 
        categoryId: category.id,
        userId 
      });

      ResponseUtils.success(res, category, 'Categoria criada com sucesso', 201);
    } catch (error) {
      logger.error('Erro ao criar categoria', { 
        error: error.message, 
        userId: req.user.id,
        body: req.validatedData.body 
      });
      next(error);
    }
  }

  async updateCategory(req, res, next) {
    try {
      const { id } = req.validatedData.params;
      const { name, description, color } = req.validatedData.body;
      const userId = req.user.id;

      const category = await this.categoryService.updateCategory(id, {
        name,
        description,
        color
      }, userId);

      logger.info('Categoria atualizada com sucesso', { 
        categoryId: id,
        userId 
      });

      ResponseUtils.success(res, category, 'Categoria atualizada com sucesso');
    } catch (error) {
      logger.error('Erro ao atualizar categoria', { 
        error: error.message, 
        id: req.validatedData.params.id,
        userId: req.user.id
      });
      next(error);
    }
  }

  async deleteCategory(req, res, next) {
    try {
      const { id } = req.validatedData.params;
      const userId = req.user.id;

      await this.categoryService.deleteCategory(id, userId);

      logger.info('Categoria deletada com sucesso', { 
        categoryId: id,
        userId 
      });

      ResponseUtils.success(res, null, 'Categoria deletada com sucesso');
    } catch (error) {
      logger.error('Erro ao deletar categoria', { 
        error: error.message, 
        id: req.validatedData.params.id,
        userId: req.user.id
      });
      next(error);
    }
  }

  async getUserCategories(req, res, next) {
    try {
      const { search, sortBy, sortOrder } = req.validatedData.query;
      const userId = req.user.id;

      const categories = await this.categoryService.getUserCategories(userId, {
        search,
        sortBy,
        sortOrder
      });

      ResponseUtils.success(res, categories, 'Categorias do usuário recuperadas com sucesso');
    } catch (error) {
      logger.error('Erro ao listar categorias do usuário', { 
        error: error.message, 
        userId: req.user.id,
        query: req.validatedData.query 
      });
      next(error);
    }
  }

  async searchCategories(req, res, next) {
    try {
      const { page, limit, search, sortBy, sortOrder } = req.validatedData.query;
      const userId = req.user.id;

      if (!search) {
        return ResponseUtils.validationError(res, [
          { field: 'search', message: 'Termo de busca é obrigatório' }
        ]);
      }

      const result = await this.categoryService.searchCategories(search, userId, {
        page,
        limit,
        sortBy,
        sortOrder
      });

      ResponseUtils.paginated(res, result.categories, result.pagination, 'Busca realizada com sucesso');
    } catch (error) {
      logger.error('Erro na busca de categorias', { 
        error: error.message, 
        userId: req.user.id,
        query: req.validatedData.query 
      });
      next(error);
    }
  }

  async getCategoryStats(req, res, next) {
    try {
      const { id } = req.validatedData.params;
      const userId = req.user.id;

      const result = await this.categoryService.getCategoryStats(id, userId);

      ResponseUtils.success(res, result, 'Estatísticas da categoria recuperadas com sucesso');
    } catch (error) {
      logger.error('Erro ao buscar estatísticas da categoria', { 
        error: error.message, 
        id: req.validatedData.params.id,
        userId: req.user.id
      });
      next(error);
    }
  }

  async getCategoriesWithStats(req, res, next) {
    try {
      const { page, limit, search, sortBy, sortOrder } = req.validatedData.query;
      const userId = req.user.id;

      const result = await this.categoryService.getCategories({
        page,
        limit,
        search,
        sortBy,
        sortOrder,
        userId
      });

      // As categorias já vêm com contagem de tarefas do repository
      ResponseUtils.paginated(res, result.categories, result.pagination, 'Categorias com estatísticas recuperadas com sucesso');
    } catch (error) {
      logger.error('Erro ao listar categorias com estatísticas', { 
        error: error.message, 
        userId: req.user.id,
        query: req.validatedData.query 
      });
      next(error);
    }
  }
}
