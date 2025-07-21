import prisma from '../config/database.js';
import { Task } from '../entities/Task.js';
import logger from '../config/logger.js';

export class TaskRepository {
  async findAll(options = {}) {
    try {
      const { 
        page = 1, 
        limit = 10, 
        search, 
        userId, 
        status, 
        priority, 
        categoryId,
        assigneeId,
        overdue,
        sortBy = 'createdAt', 
        sortOrder = 'desc' 
      } = options;
      
      const skip = (page - 1) * limit;

      const where = {
        ...(userId && { ownerId: userId }),
        ...(status && { status }),
        ...(priority && { priority }),
        ...(categoryId && { categoryId }),
        ...(assigneeId && {
          assignments: {
            some: { userId: assigneeId }
          }
        }),
        ...(overdue && {
          dueDate: { lt: new Date() },
          status: { not: 'COMPLETED' }
        }),
        ...(search && {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } }
          ]
        })
      };

      const [tasks, total] = await Promise.all([
        prisma.task.findMany({
          where,
          skip,
          take: limit,
          orderBy: { [sortBy]: sortOrder },
          include: {
            owner: {
              select: { id: true, name: true, email: true }
            },
            category: {
              select: { id: true, name: true, color: true }
            },
            assignments: {
              include: {
                user: {
                  select: { id: true, name: true, email: true }
                }
              }
            },
            collaborations: {
              include: {
                user: {
                  select: { id: true, name: true, email: true }
                }
              }
            }
          }
        }),
        prisma.task.count({ where })
      ]);

      return {
        tasks: tasks.map(task => ({
          ...Task.fromPrisma(task),
          owner: task.owner,
          category: task.category,
          assignees: task.assignments.map(assignment => assignment.user),
          collaborators: task.collaborations.map(collaboration => ({
            ...collaboration.user,
            role: collaboration.role
          }))
        })),
        total
      };
    } catch (error) {
      logger.error('Erro ao buscar tarefas', { error: error.message });
      throw error;
    }
  }

  async findById(id) {
    try {
      const task = await prisma.task.findUnique({
        where: { id },
        include: {
          owner: {
            select: { id: true, name: true, email: true }
          },
          category: {
            select: { id: true, name: true, color: true }
          },
          assignments: {
            include: {
              user: {
                select: { id: true, name: true, email: true }
              }
            }
          },
          collaborations: {
            include: {
              user: {
                select: { id: true, name: true, email: true }
              }
            }
          }
        }
      });

      if (!task) return null;

      return {
        ...Task.fromPrisma(task),
        owner: task.owner,
        category: task.category,
        assignees: task.assignments.map(assignment => assignment.user),
        collaborators: task.collaborations.map(collaboration => ({
          ...collaboration.user,
          role: collaboration.role
        }))
      };
    } catch (error) {
      logger.error('Erro ao buscar tarefa por ID', { id, error: error.message });
      throw error;
    }
  }

  async create(taskData) {
    try {
      const task = await prisma.task.create({
        data: taskData,
        include: {
          owner: {
            select: { id: true, name: true, email: true }
          },
          category: {
            select: { id: true, name: true, color: true }
          }
        }
      });

      logger.info('Tarefa criada', { taskId: task.id, title: task.title });
      return {
        ...Task.fromPrisma(task),
        owner: task.owner,
        category: task.category,
        assignees: [],
        collaborators: []
      };
    } catch (error) {
      logger.error('Erro ao criar tarefa', { taskData, error: error.message });
      throw error;
    }
  }

  async update(id, taskData) {
    try {
      const task = await prisma.task.update({
        where: { id },
        data: taskData,
        include: {
          owner: {
            select: { id: true, name: true, email: true }
          },
          category: {
            select: { id: true, name: true, color: true }
          },
          assignments: {
            include: {
              user: {
                select: { id: true, name: true, email: true }
              }
            }
          },
          collaborations: {
            include: {
              user: {
                select: { id: true, name: true, email: true }
              }
            }
          }
        }
      });

      logger.info('Tarefa atualizada', { taskId: id });
      return {
        ...Task.fromPrisma(task),
        owner: task.owner,
        category: task.category,
        assignees: task.assignments.map(assignment => assignment.user),
        collaborators: task.collaborations.map(collaboration => ({
          ...collaboration.user,
          role: collaboration.role
        }))
      };
    } catch (error) {
      logger.error('Erro ao atualizar tarefa', { id, taskData, error: error.message });
      throw error;
    }
  }

  async delete(id) {
    try {
      await prisma.task.delete({
        where: { id }
      });

      logger.info('Tarefa deletada', { taskId: id });
      return true;
    } catch (error) {
      logger.error('Erro ao deletar tarefa', { id, error: error.message });
      throw error;
    }
  }

  async assignUser(taskId, userId) {
    try {
      const assignment = await prisma.taskAssignment.create({
        data: { taskId, userId },
        include: {
          user: {
            select: { id: true, name: true, email: true }
          }
        }
      });

      logger.info('Usuário atribuído à tarefa', { taskId, userId });
      return assignment.user;
    } catch (error) {
      logger.error('Erro ao atribuir usuário à tarefa', { taskId, userId, error: error.message });
      throw error;
    }
  }

  async unassignUser(taskId, userId) {
    try {
      await prisma.taskAssignment.delete({
        where: { taskId_userId: { taskId, userId } }
      });

      logger.info('Usuário removido da tarefa', { taskId, userId });
      return true;
    } catch (error) {
      logger.error('Erro ao remover usuário da tarefa', { taskId, userId, error: error.message });
      throw error;
    }
  }

  async addCollaborator(taskId, userId, role = 'VIEWER') {
    try {
      const collaboration = await prisma.taskCollaboration.create({
        data: { taskId, userId, role, acceptedAt: new Date() },
        include: {
          user: {
            select: { id: true, name: true, email: true }
          }
        }
      });

      logger.info('Colaborador adicionado à tarefa', { taskId, userId, role });
      return {
        ...collaboration.user,
        role: collaboration.role
      };
    } catch (error) {
      logger.error('Erro ao adicionar colaborador à tarefa', { 
        taskId, userId, role, error: error.message 
      });
      throw error;
    }
  }

  async removeCollaborator(taskId, userId) {
    try {
      await prisma.taskCollaboration.delete({
        where: { taskId_userId: { taskId, userId } }
      });

      logger.info('Colaborador removido da tarefa', { taskId, userId });
      return true;
    } catch (error) {
      logger.error('Erro ao remover colaborador da tarefa', { 
        taskId, userId, error: error.message 
      });
      throw error;
    }
  }

  async belongsToUser(taskId, userId) {
    try {
      const count = await prisma.task.count({
        where: { id: taskId, ownerId: userId }
      });

      return count > 0;
    } catch (error) {
      logger.error('Erro ao verificar propriedade da tarefa', { 
        taskId, userId, error: error.message 
      });
      throw error;
    }
  }

  async hasAccess(taskId, userId) {
    try {
      const task = await prisma.task.findUnique({
        where: { id: taskId },
        include: {
          assignments: { where: { userId } },
          collaborations: { where: { userId } }
        }
      });

      if (!task) return false;

      return task.ownerId === userId || 
             task.assignments.length > 0 || 
             task.collaborations.length > 0;
    } catch (error) {
      logger.error('Erro ao verificar acesso à tarefa', { 
        taskId, userId, error: error.message 
      });
      throw error;
    }
  }

  async getTasksByStatus(userId) {
    try {
      const tasks = await prisma.task.groupBy({
        by: ['status'],
        where: { ownerId: userId },
        _count: { status: true }
      });

      return tasks.reduce((acc, task) => {
        acc[task.status] = task._count.status;
        return acc;
      }, {});
    } catch (error) {
      logger.error('Erro ao buscar tarefas por status', { userId, error: error.message });
      throw error;
    }
  }

  async getTasksByPriority(userId) {
    try {
      const tasks = await prisma.task.groupBy({
        by: ['priority'],
        where: { ownerId: userId },
        _count: { priority: true }
      });

      return tasks.reduce((acc, task) => {
        acc[task.priority] = task._count.priority;
        return acc;
      }, {});
    } catch (error) {
      logger.error('Erro ao buscar tarefas por prioridade', { userId, error: error.message });
      throw error;
    }
  }

  async getOverdueTasks(userId) {
    try {
      const count = await prisma.task.count({
        where: {
          ownerId: userId,
          dueDate: { lt: new Date() },
          status: { not: 'COMPLETED' }
        }
      });

      return count;
    } catch (error) {
      logger.error('Erro ao buscar tarefas em atraso', { userId, error: error.message });
      throw error;
    }
  }
}
