import prisma from '../config/database.js';
import { User } from '../entities/User.js';
import logger from '../config/logger.js';

export class UserRepository {
  async findAll(options = {}) {
    try {
      const { page = 1, limit = 10, search, sortBy = 'createdAt', sortOrder = 'desc' } = options;
      const skip = (page - 1) * limit;

      const where = search ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } }
        ]
      } : {};

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          skip,
          take: limit,
          orderBy: { [sortBy]: sortOrder },
          select: {
            id: true,
            email: true,
            name: true,
            avatar: true,
            createdAt: true,
            updatedAt: true
          }
        }),
        prisma.user.count({ where })
      ]);

      return {
        users: users.map(user => User.fromPrisma(user)),
        total
      };
    } catch (error) {
      logger.error('Erro ao buscar usuários', { error: error.message });
      throw error;
    }
  }

  async findById(id) {
    try {
      const user = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
          createdAt: true,
          updatedAt: true
        }
      });

      return user ? User.fromPrisma(user) : null;
    } catch (error) {
      logger.error('Erro ao buscar usuário por ID', { id, error: error.message });
      throw error;
    }
  }

  async findByEmail(email) {
    try {
      const user = await prisma.user.findUnique({
        where: { email }
      });

      return user ? User.fromPrisma(user) : null;
    } catch (error) {
      logger.error('Erro ao buscar usuário por email', { email, error: error.message });
      throw error;
    }
  }

  async create(userData) {
    try {
      const user = await prisma.user.create({
        data: userData,
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
          createdAt: true,
          updatedAt: true
        }
      });

      logger.info('Usuário criado', { userId: user.id, email: user.email });
      return User.fromPrisma(user);
    } catch (error) {
      logger.error('Erro ao criar usuário', { userData, error: error.message });
      throw error;
    }
  }

  async update(id, userData) {
    try {
      const user = await prisma.user.update({
        where: { id },
        data: userData,
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
          createdAt: true,
          updatedAt: true
        }
      });

      logger.info('Usuário atualizado', { userId: id });
      return User.fromPrisma(user);
    } catch (error) {
      logger.error('Erro ao atualizar usuário', { id, userData, error: error.message });
      throw error;
    }
  }

  async delete(id) {
    try {
      await prisma.user.delete({
        where: { id }
      });

      logger.info('Usuário deletado', { userId: id });
      return true;
    } catch (error) {
      logger.error('Erro ao deletar usuário', { id, error: error.message });
      throw error;
    }
  }

  async existsById(id) {
    try {
      const count = await prisma.user.count({
        where: { id }
      });

      return count > 0;
    } catch (error) {
      logger.error('Erro ao verificar existência do usuário', { id, error: error.message });
      throw error;
    }
  }

  async existsByEmail(email, excludeId = null) {
    try {
      const where = { email };
      if (excludeId) {
        where.id = { not: excludeId };
      }

      const count = await prisma.user.count({ where });
      return count > 0;
    } catch (error) {
      logger.error('Erro ao verificar existência do email', { email, error: error.message });
      throw error;
    }
  }

  async getTasksCount(userId) {
    try {
      const [ownedTasks, assignedTasks] = await Promise.all([
        prisma.task.count({ where: { ownerId: userId } }),
        prisma.taskAssignment.count({ where: { userId } })
      ]);

      return {
        ownedTasks,
        assignedTasks,
        totalTasks: ownedTasks + assignedTasks
      };
    } catch (error) {
      logger.error('Erro ao contar tarefas do usuário', { userId, error: error.message });
      throw error;
    }
  }
}
