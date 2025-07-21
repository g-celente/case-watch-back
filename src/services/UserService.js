import { UserRepository } from '../repositories/UserRepository.js';
import { PaginationUtils } from '../utils/pagination.js';
import logger from '../config/logger.js';

export class UserService {
  constructor() {
    this.userRepository = new UserRepository();
  }

  async getUsers(options = {}) {
    try {
      const { page, limit, skip } = PaginationUtils.getPaginationData(options.page, options.limit);
      
      const result = await this.userRepository.findAll({
        ...options,
        page,
        limit,
        skip
      });

      const pagination = PaginationUtils.getPaginationInfo(page, limit, result.total);

      logger.info('Usuários listados', { 
        total: result.total, 
        page, 
        limit 
      });

      return {
        users: result.users.map(user => user.toJSON()),
        pagination
      };
    } catch (error) {
      logger.error('Erro ao listar usuários', { error: error.message, options });
      throw error;
    }
  }

  async getUserById(id) {
    try {
      const user = await this.userRepository.findById(id);
      if (!user) {
        throw new Error('Usuário não encontrado');
      }

      const tasksCount = await this.userRepository.getTasksCount(id);

      return {
        user: user.toJSON(),
        stats: tasksCount
      };
    } catch (error) {
      logger.error('Erro ao buscar usuário', { error: error.message, id });
      throw error;
    }
  }

  async updateUser(id, updateData) {
    try {
      const { email, name, avatar } = updateData;

      // Verifica se o usuário existe
      const existingUser = await this.userRepository.findById(id);
      if (!existingUser) {
        throw new Error('Usuário não encontrado');
      }

      // Verifica se o email já está em uso por outro usuário
      if (email && email !== existingUser.email) {
        const emailExists = await this.userRepository.existsByEmail(email, id);
        if (emailExists) {
          throw new Error('Email já está em uso');
        }
      }

      const dataToUpdate = {};
      if (email) dataToUpdate.email = email;
      if (name) dataToUpdate.name = name;
      if (avatar) dataToUpdate.avatar = avatar;

      const updatedUser = await this.userRepository.update(id, dataToUpdate);

      logger.info('Usuário atualizado', { userId: id });

      return updatedUser.toJSON();
    } catch (error) {
      logger.error('Erro ao atualizar usuário', { 
        error: error.message, 
        id, 
        updateData 
      });
      throw error;
    }
  }

  async deleteUser(id) {
    try {
      const user = await this.userRepository.findById(id);
      if (!user) {
        throw new Error('Usuário não encontrado');
      }

      await this.userRepository.delete(id);

      logger.info('Usuário deletado', { userId: id });

      return true;
    } catch (error) {
      logger.error('Erro ao deletar usuário', { error: error.message, id });
      throw error;
    }
  }

  async searchUsers(query, options = {}) {
    try {
      const { page, limit, skip } = PaginationUtils.getPaginationData(options.page, options.limit);
      
      const result = await this.userRepository.findAll({
        search: query,
        page,
        limit,
        skip,
        sortBy: options.sortBy,
        sortOrder: options.sortOrder
      });

      const pagination = PaginationUtils.getPaginationInfo(page, limit, result.total);

      logger.info('Busca de usuários realizada', { 
        query, 
        total: result.total, 
        page, 
        limit 
      });

      return {
        users: result.users.map(user => user.toJSON()),
        pagination,
        query
      };
    } catch (error) {
      logger.error('Erro na busca de usuários', { error: error.message, query, options });
      throw error;
    }
  }

  async getUserStats(id) {
    try {
      const user = await this.userRepository.findById(id);
      if (!user) {
        throw new Error('Usuário não encontrado');
      }

      const tasksCount = await this.userRepository.getTasksCount(id);

      return {
        userId: id,
        username: user.name,
        email: user.email,
        ...tasksCount,
        joinedAt: user.createdAt
      };
    } catch (error) {
      logger.error('Erro ao buscar estatísticas do usuário', { error: error.message, id });
      throw error;
    }
  }

  async checkUserExists(id) {
    try {
      return await this.userRepository.existsById(id);
    } catch (error) {
      logger.error('Erro ao verificar existência do usuário', { error: error.message, id });
      throw error;
    }
  }

  async getUsersByIds(ids) {
    try {
      const users = await Promise.all(
        ids.map(id => this.userRepository.findById(id))
      );

      return users
        .filter(user => user !== null)
        .map(user => user.toJSON());
    } catch (error) {
      logger.error('Erro ao buscar usuários por IDs', { error: error.message, ids });
      throw error;
    }
  }
}
