import { UserService } from '../services/UserService.js';
import { ResponseUtils } from '../utils/response.js';
import logger from '../config/logger.js';

export class UserController {
  constructor() {
    this.userService = new UserService();
  }

  async getUsers(req, res, next) {
    try {
      const { page, limit, search, sortBy, sortOrder } = req.validatedData.query;

      const result = await this.userService.getUsers({
        page,
        limit,
        search,
        sortBy,
        sortOrder
      });

      ResponseUtils.paginated(res, result.users, result.pagination, 'Usuários recuperados com sucesso');
    } catch (error) {
      logger.error('Erro ao listar usuários', { 
        error: error.message, 
        query: req.validatedData.query 
      });
      next(error);
    }
  }

  async getUserById(req, res, next) {
    try {
      const { id } = req.validatedData.params;

      const result = await this.userService.getUserById(id);

      ResponseUtils.success(res, result, 'Usuário recuperado com sucesso');
    } catch (error) {
      logger.error('Erro ao buscar usuário', { 
        error: error.message, 
        id: req.validatedData.params.id 
      });
      next(error);
    }
  }

  async updateUser(req, res, next) {
    try {
      const { id } = req.validatedData.params;
      const { email, name, avatar } = req.validatedData.body;

      const result = await this.userService.updateUser(id, {
        email,
        name,
        avatar
      });

      logger.info('Usuário atualizado com sucesso', { userId: id });

      ResponseUtils.success(res, result, 'Usuário atualizado com sucesso');
    } catch (error) {
      logger.error('Erro ao atualizar usuário', { 
        error: error.message, 
        id: req.validatedData.params.id 
      });
      next(error);
    }
  }

  async deleteUser(req, res, next) {
    try {
      const { id } = req.validatedData.params;

      await this.userService.deleteUser(id);

      logger.info('Usuário deletado com sucesso', { userId: id });

      ResponseUtils.success(res, null, 'Usuário deletado com sucesso');
    } catch (error) {
      logger.error('Erro ao deletar usuário', { 
        error: error.message, 
        id: req.validatedData.params.id 
      });
      next(error);
    }
  }

  async searchUsers(req, res, next) {
    try {
      const { page, limit, search, sortBy, sortOrder } = req.validatedData.query;

      if (!search) {
        return ResponseUtils.validationError(res, [
          { field: 'search', message: 'Termo de busca é obrigatório' }
        ]);
      }

      const result = await this.userService.searchUsers(search, {
        page,
        limit,
        sortBy,
        sortOrder
      });

      ResponseUtils.paginated(res, result.users, result.pagination, 'Busca realizada com sucesso');
    } catch (error) {
      logger.error('Erro na busca de usuários', { 
        error: error.message, 
        query: req.validatedData.query 
      });
      next(error);
    }
  }

  async getUserStats(req, res, next) {
    try {
      const { id } = req.validatedData.params;

      const result = await this.userService.getUserStats(id);

      ResponseUtils.success(res, result, 'Estatísticas do usuário recuperadas com sucesso');
    } catch (error) {
      logger.error('Erro ao buscar estatísticas do usuário', { 
        error: error.message, 
        id: req.validatedData.params.id 
      });
      next(error);
    }
  }

  async getCurrentUser(req, res, next) {
    try {
      const userId = req.user.id;

      const result = await this.userService.getUserById(userId);

      ResponseUtils.success(res, result, 'Usuário atual recuperado com sucesso');
    } catch (error) {
      logger.error('Erro ao buscar usuário atual', { 
        error: error.message, 
        userId: req.user.id 
      });
      next(error);
    }
  }

  async updateCurrentUser(req, res, next) {
    try {
      const userId = req.user.id;
      const { email, name, avatar } = req.validatedData.body;

      const result = await this.userService.updateUser(userId, {
        email,
        name,
        avatar
      });

      logger.info('Usuário atual atualizado com sucesso', { userId });

      ResponseUtils.success(res, result, 'Usuário atualizado com sucesso');
    } catch (error) {
      logger.error('Erro ao atualizar usuário atual', { 
        error: error.message, 
        userId: req.user.id 
      });
      next(error);
    }
  }

  async deleteCurrentUser(req, res, next) {
    try {
      const userId = req.user.id;

      await this.userService.deleteUser(userId);

      logger.info('Usuário atual deletado com sucesso', { userId });

      ResponseUtils.success(res, null, 'Conta deletada com sucesso');
    } catch (error) {
      logger.error('Erro ao deletar usuário atual', { 
        error: error.message, 
        userId: req.user.id 
      });
      next(error);
    }
  }

  async getCurrentUserStats(req, res, next) {
    try {
      const userId = req.user.id;

      const result = await this.userService.getUserStats(userId);

      ResponseUtils.success(res, result, 'Estatísticas recuperadas com sucesso');
    } catch (error) {
      logger.error('Erro ao buscar estatísticas do usuário atual', { 
        error: error.message, 
        userId: req.user.id 
      });
      next(error);
    }
  }
}
