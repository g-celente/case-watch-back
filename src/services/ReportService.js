import { TaskRepository } from '../repositories/TaskRepository.js';
import { CategoryRepository } from '../repositories/CategoryRepository.js';
import { UserRepository } from '../repositories/UserRepository.js';
import { TaskStatus } from '../entities/Task.js';
import logger from '../config/logger.js';

export class ReportService {
  constructor() {
    this.taskRepository = new TaskRepository();
    this.categoryRepository = new CategoryRepository();
    this.userRepository = new UserRepository();
  }

  async getTasksByStatusReport(userId, options = {}) {
    try {
      const { startDate, endDate } = options;

      const tasks = await this.taskRepository.findAll({
        userId,
        ...(startDate && { createdAt: { gte: new Date(startDate) } }),
        ...(endDate && { createdAt: { lte: new Date(endDate) } })
      });

      const tasksByStatus = tasks.tasks.reduce((acc, task) => {
        acc[task.status] = (acc[task.status] || 0) + 1;
        return acc;
      }, {});

      const totalTasks = tasks.total;
      const completedTasks = tasksByStatus[TaskStatus.COMPLETED] || 0;
      const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

      logger.info('Relatório de tarefas por status gerado', { userId, totalTasks });

      return {
        tasksByStatus,
        totalTasks,
        completedTasks,
        completionRate: Math.round(completionRate * 100) / 100,
        period: {
          startDate: startDate || null,
          endDate: endDate || null
        }
      };
    } catch (error) {
      logger.error('Erro ao gerar relatório de tarefas por status', { 
        error: error.message, 
        userId, 
        options 
      });
      throw error;
    }
  }

  async getTasksByCategoryReport(userId, options = {}) {
    try {
      const { startDate, endDate } = options;

      const tasks = await this.taskRepository.findAll({
        userId,
        ...(startDate && { createdAt: { gte: new Date(startDate) } }),
        ...(endDate && { createdAt: { lte: new Date(endDate) } })
      });

      const tasksByCategory = tasks.tasks.reduce((acc, task) => {
        const categoryName = task.category?.name || 'Sem categoria';
        const categoryId = task.category?.id || null;
        
        if (!acc[categoryName]) {
          acc[categoryName] = {
            id: categoryId,
            name: categoryName,
            total: 0,
            completed: 0,
            inProgress: 0,
            pending: 0,
            cancelled: 0
          };
        }

        acc[categoryName].total += 1;
        acc[categoryName][task.status.toLowerCase()] = (acc[categoryName][task.status.toLowerCase()] || 0) + 1;
        
        return acc;
      }, {});

      const totalTasks = tasks.total;
      const categoriesCount = Object.keys(tasksByCategory).length;

      logger.info('Relatório de tarefas por categoria gerado', { userId, totalTasks, categoriesCount });

      return {
        tasksByCategory: Object.values(tasksByCategory),
        totalTasks,
        categoriesCount,
        period: {
          startDate: startDate || null,
          endDate: endDate || null
        }
      };
    } catch (error) {
      logger.error('Erro ao gerar relatório de tarefas por categoria', { 
        error: error.message, 
        userId, 
        options 
      });
      throw error;
    }
  }

  async getUserPerformanceReport(userId, options = {}) {
    try {
      const { startDate, endDate } = options;

      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new Error('Usuário não encontrado');
      }

      const tasks = await this.taskRepository.findAll({
        userId,
        ...(startDate && { createdAt: { gte: new Date(startDate) } }),
        ...(endDate && { createdAt: { lte: new Date(endDate) } })
      });

      const tasksByStatus = await this.taskRepository.getTasksByStatus(userId);
      const tasksByPriority = await this.taskRepository.getTasksByPriority(userId);
      const overdueTasks = await this.taskRepository.getOverdueTasks(userId);

      const totalTasks = tasks.total;
      const completedTasks = tasksByStatus[TaskStatus.COMPLETED] || 0;
      const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

      // Calcula média de tempo para completar tarefas
      const completedTasksWithTime = tasks.tasks.filter(task => 
        task.status === TaskStatus.COMPLETED && 
        task.createdAt && 
        task.updatedAt
      );

      const averageCompletionTime = completedTasksWithTime.length > 0 
        ? completedTasksWithTime.reduce((acc, task) => {
            const diffTime = new Date(task.updatedAt) - new Date(task.createdAt);
            return acc + diffTime;
          }, 0) / completedTasksWithTime.length
        : 0;

      const averageCompletionDays = Math.round(averageCompletionTime / (1000 * 60 * 60 * 24) * 100) / 100;

      logger.info('Relatório de performance do usuário gerado', { 
        userId, 
        totalTasks, 
        completionRate 
      });

      return {
        user: {
          id: user.id,
          name: user.name,
          email: user.email
        },
        summary: {
          totalTasks,
          completedTasks,
          completionRate: Math.round(completionRate * 100) / 100,
          overdueTasks,
          averageCompletionDays
        },
        breakdown: {
          tasksByStatus,
          tasksByPriority
        },
        period: {
          startDate: startDate || null,
          endDate: endDate || null
        }
      };
    } catch (error) {
      logger.error('Erro ao gerar relatório de performance do usuário', { 
        error: error.message, 
        userId, 
        options 
      });
      throw error;
    }
  }

  async getProductivityReport(userId, options = {}) {
    try {
      const { startDate, endDate, groupBy = 'day' } = options;

      const tasks = await this.taskRepository.findAll({
        userId,
        ...(startDate && { createdAt: { gte: new Date(startDate) } }),
        ...(endDate && { createdAt: { lte: new Date(endDate) } })
      });

      // Agrupa tarefas por período
      const tasksByPeriod = tasks.tasks.reduce((acc, task) => {
        const date = new Date(task.createdAt);
        let key;

        switch (groupBy) {
          case 'day':
            key = date.toISOString().split('T')[0];
            break;
          case 'week':
            const weekStart = new Date(date.setDate(date.getDate() - date.getDay()));
            key = weekStart.toISOString().split('T')[0];
            break;
          case 'month':
            key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            break;
          default:
            key = date.toISOString().split('T')[0];
        }

        if (!acc[key]) {
          acc[key] = {
            period: key,
            created: 0,
            completed: 0,
            inProgress: 0,
            pending: 0
          };
        }

        acc[key].created += 1;
        acc[key][task.status.toLowerCase()] = (acc[key][task.status.toLowerCase()] || 0) + 1;

        return acc;
      }, {});

      const productivityData = Object.values(tasksByPeriod).sort((a, b) => 
        new Date(a.period) - new Date(b.period)
      );

      logger.info('Relatório de produtividade gerado', { 
        userId, 
        periods: productivityData.length,
        groupBy
      });

      return {
        productivityData,
        groupBy,
        period: {
          startDate: startDate || null,
          endDate: endDate || null
        }
      };
    } catch (error) {
      logger.error('Erro ao gerar relatório de produtividade', { 
        error: error.message, 
        userId, 
        options 
      });
      throw error;
    }
  }

  async getCollaborationReport(userId, options = {}) {
    try {
      const { startDate, endDate } = options;

      const tasks = await this.taskRepository.findAll({
        userId,
        ...(startDate && { createdAt: { gte: new Date(startDate) } }),
        ...(endDate && { createdAt: { lte: new Date(endDate) } })
      });

      const collaborationStats = {
        tasksWithCollaborators: 0,
        tasksWithAssignees: 0,
        totalCollaborators: new Set(),
        totalAssignees: new Set(),
        collaborationsByTask: []
      };

      tasks.tasks.forEach(task => {
        if (task.collaborators && task.collaborators.length > 0) {
          collaborationStats.tasksWithCollaborators += 1;
          task.collaborators.forEach(collaborator => {
            collaborationStats.totalCollaborators.add(collaborator.id);
          });
        }

        if (task.assignees && task.assignees.length > 0) {
          collaborationStats.tasksWithAssignees += 1;
          task.assignees.forEach(assignee => {
            collaborationStats.totalAssignees.add(assignee.id);
          });
        }

        if ((task.collaborators && task.collaborators.length > 0) || 
            (task.assignees && task.assignees.length > 0)) {
          collaborationStats.collaborationsByTask.push({
            taskId: task.id,
            title: task.title,
            collaborators: task.collaborators || [],
            assignees: task.assignees || []
          });
        }
      });

      const collaborationRate = tasks.total > 0 
        ? ((collaborationStats.tasksWithCollaborators + collaborationStats.tasksWithAssignees) / tasks.total) * 100 
        : 0;

      logger.info('Relatório de colaboração gerado', { 
        userId, 
        totalTasks: tasks.total,
        collaborationRate
      });

      return {
        summary: {
          totalTasks: tasks.total,
          tasksWithCollaborators: collaborationStats.tasksWithCollaborators,
          tasksWithAssignees: collaborationStats.tasksWithAssignees,
          uniqueCollaborators: collaborationStats.totalCollaborators.size,
          uniqueAssignees: collaborationStats.totalAssignees.size,
          collaborationRate: Math.round(collaborationRate * 100) / 100
        },
        collaborationsByTask: collaborationStats.collaborationsByTask,
        period: {
          startDate: startDate || null,
          endDate: endDate || null
        }
      };
    } catch (error) {
      logger.error('Erro ao gerar relatório de colaboração', { 
        error: error.message, 
        userId, 
        options 
      });
      throw error;
    }
  }

  async getDashboardData(userId) {
    try {
      const [
        tasksByStatus,
        tasksByPriority,
        overdueTasks,
        recentTasks,
        categories
      ] = await Promise.all([
        this.taskRepository.getTasksByStatus(userId),
        this.taskRepository.getTasksByPriority(userId),
        this.taskRepository.getOverdueTasks(userId),
        this.taskRepository.findAll({ userId, limit: 5, sortBy: 'createdAt', sortOrder: 'desc' }),
        this.categoryRepository.findByUserId(userId, { limit: 5, sortBy: 'createdAt', sortOrder: 'desc' })
      ]);

      const totalTasks = Object.values(tasksByStatus).reduce((sum, count) => sum + count, 0);
      const completedTasks = tasksByStatus[TaskStatus.COMPLETED] || 0;
      const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

      logger.info('Dados do dashboard gerados', { userId, totalTasks });

      return {
        summary: {
          totalTasks,
          completedTasks,
          completionRate: Math.round(completionRate * 100) / 100,
          overdueTasks,
          totalCategories: categories.length
        },
        breakdown: {
          tasksByStatus,
          tasksByPriority
        },
        recentTasks: recentTasks.tasks,
        recentCategories: categories
      };
    } catch (error) {
      logger.error('Erro ao gerar dados do dashboard', { 
        error: error.message, 
        userId 
      });
      throw error;
    }
  }
}
