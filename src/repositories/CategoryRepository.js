import prisma from '../config/database.js';
import { Category } from '../entities/Category.js';
import logger from '../config/logger.js';

export class CategoryRepository {
  async findAll(options = {}) {
    try {
      const { 
        page = 1, 
        limit = 10, 
        search, 
        userId, 
        sortBy = 'createdAt', 
        sortOrder = 'desc' 
      } = options;
      
      const skip = (page - 1) * limit;

      const where = {
        ...(userId && { userId }),
        ...(search && {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } }
          ]
        })
      };

      const [categories, total] = await Promise.all([
        prisma.category.findMany({
          where,
          skip,
          take: limit,
          orderBy: { [sortBy]: sortOrder },
          include: {
            _count: {
              select: { tasks: true }
            }
          }
        }),
        prisma.category.count({ where })
      ]);

      return {
        categories: categories.map(category => ({
          ...Category.fromPrisma(category),
          tasksCount: category._count.tasks
        })),
        total
      };
    } catch (error) {
      logger.error('Erro ao buscar categorias', { error: error.message });
      throw error;
    }
  }

  async findById(id) {
    try {
      const category = await prisma.category.findUnique({
        where: { id },
        include: {
          _count: {
            select: { tasks: true }
          }
        }
      });

      if (!category) return null;

      return {
        ...Category.fromPrisma(category),
        tasksCount: category._count.tasks
      };
    } catch (error) {
      logger.error('Erro ao buscar categoria por ID', { id, error: error.message });
      throw error;
    }
  }

  async findByUserId(userId, options = {}) {
    try {
      const { search, sortBy = 'createdAt', sortOrder = 'desc' } = options;

      const where = {
        userId,
        ...(search && {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } }
          ]
        })
      };

      const categories = await prisma.category.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        include: {
          _count: {
            select: { tasks: true }
          }
        }
      });

      return categories.map(category => ({
        ...Category.fromPrisma(category),
        tasksCount: category._count.tasks
      }));
    } catch (error) {
      logger.error('Erro ao buscar categorias do usuário', { userId, error: error.message });
      throw error;
    }
  }

  async create(categoryData) {
    try {
      const category = await prisma.category.create({
        data: categoryData,
        include: {
          _count: {
            select: { tasks: true }
          }
        }
      });

      logger.info('Categoria criada', { categoryId: category.id, name: category.name });
      return {
        ...Category.fromPrisma(category),
        tasksCount: category._count.tasks
      };
    } catch (error) {
      logger.error('Erro ao criar categoria', { categoryData, error: error.message });
      throw error;
    }
  }

  async update(id, categoryData) {
    try {
      const category = await prisma.category.update({
        where: { id },
        data: categoryData,
        include: {
          _count: {
            select: { tasks: true }
          }
        }
      });

      logger.info('Categoria atualizada', { categoryId: id });
      return {
        ...Category.fromPrisma(category),
        tasksCount: category._count.tasks
      };
    } catch (error) {
      logger.error('Erro ao atualizar categoria', { id, categoryData, error: error.message });
      throw error;
    }
  }

  async delete(id) {
    try {
      await prisma.category.delete({
        where: { id }
      });

      logger.info('Categoria deletada', { categoryId: id });
      return true;
    } catch (error) {
      logger.error('Erro ao deletar categoria', { id, error: error.message });
      throw error;
    }
  }

  async existsById(id) {
    try {
      const count = await prisma.category.count({
        where: { id }
      });

      return count > 0;
    } catch (error) {
      logger.error('Erro ao verificar existência da categoria', { id, error: error.message });
      throw error;
    }
  }

  async existsByName(name, userId, excludeId = null) {
    try {
      const where = { name, userId };
      if (excludeId) {
        where.id = { not: excludeId };
      }

      const count = await prisma.category.count({ where });
      return count > 0;
    } catch (error) {
      logger.error('Erro ao verificar existência do nome da categoria', { 
        name, userId, error: error.message 
      });
      throw error;
    }
  }

  async belongsToUser(categoryId, userId) {
    try {
      const count = await prisma.category.count({
        where: { id: categoryId, userId }
      });

      return count > 0;
    } catch (error) {
      logger.error('Erro ao verificar propriedade da categoria', { 
        categoryId, userId, error: error.message 
      });
      throw error;
    }
  }

  async getTasksCount(categoryId) {
    try {
      const count = await prisma.task.count({
        where: { categoryId }
      });

      return count;
    } catch (error) {
      logger.error('Erro ao contar tarefas da categoria', { 
        categoryId, error: error.message 
      });
      throw error;
    }
  }

  async getTasksByStatus(categoryId) {
    try {
      const tasks = await prisma.task.groupBy({
        by: ['status'],
        where: { categoryId },
        _count: { status: true }
      });

      return tasks.reduce((acc, task) => {
        acc[task.status] = task._count.status;
        return acc;
      }, {});
    } catch (error) {
      logger.error('Erro ao buscar tarefas por status da categoria', { 
        categoryId, error: error.message 
      });
      throw error;
    }
  }
}
