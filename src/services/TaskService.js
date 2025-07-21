import { TaskRepository } from '../repositories/TaskRepository.js';
import { CategoryRepository } from '../repositories/CategoryRepository.js';
import { UserRepository } from '../repositories/UserRepository.js';
import { PaginationUtils } from '../utils/pagination.js';
import { TaskStatus, Priority } from '../entities/Task.js';
import logger from '../config/logger.js';

export class TaskService {
  constructor() {
    this.taskRepository = new TaskRepository();
    this.categoryRepository = new CategoryRepository();
    this.userRepository = new UserRepository();
  }

  async getTasks(options = {}) {
    try {
      const { page, limit, skip } = PaginationUtils.getPaginationData(options.page, options.limit);

      const result = await this.taskRepository.findAll({
        ...options,
        page,
        limit,
        skip
      });

      const pagination = PaginationUtils.getPaginationInfo(page, limit, result.total);

      logger.info('Tarefas listadas', {
        total: result.total,
        page,
        limit,
        userId: options.userId
      });

      return {
        tasks: result.tasks,
        pagination
      };
    } catch (error) {
      logger.error('Erro ao listar tarefas', { error: error.message, options });
      throw error;
    }
  }

  async getTaskById(id, userId) {
    try {
      const task = await this.taskRepository.findById(id);
      if (!task) {
        throw new Error('Tarefa não encontrada');
      }

      // Verifica se o usuário tem acesso à tarefa
      const hasAccess = await this.taskRepository.hasAccess(id, userId);
      if (!hasAccess) {
        throw new Error('Você não tem permissão para visualizar esta tarefa');
      }

      return task;
    } catch (error) {
      logger.error('Erro ao buscar tarefa', { error: error.message, id, userId });
      throw error;
    }
  }

  async createTask(taskData) {
    try {
      const { title, description, priority, dueDate, categoryId, ownerId } = taskData;

      // Valida categoria se fornecida
      if (categoryId) {
        const categoryExists = await this.categoryRepository.existsById(categoryId);
        if (!categoryExists) {
          throw new Error('Categoria não encontrada');
        }

        const categoryBelongsToUser = await this.categoryRepository.belongsToUser(categoryId, ownerId);
        if (!categoryBelongsToUser) {
          throw new Error('Categoria não pertence ao usuário');
        }
      }

      // Valida prioridade
      if (priority && !Object.values(Priority).includes(priority)) {
        throw new Error('Prioridade inválida');
      }

      // Valida data de vencimento
      if (dueDate && new Date(dueDate) < new Date()) {
        throw new Error('Data de vencimento deve ser futura');
      }

      const task = await this.taskRepository.create({
        title,
        description,
        priority: priority || Priority.MEDIUM,
        dueDate: dueDate ? new Date(dueDate) : null,
        categoryId,
        ownerId
      });
      
      // Se a tarefa foi atribuída para outra pessoa, criar assignment
      if (taskData.assigneeId && taskData.assigneeId !== ownerId) {
        await this.taskRepository.assignTask(task.id, taskData.assigneeId);
      }

      return task;
    } catch (error) {
      logger.error('Erro ao criar tarefa', { error: error.message, taskData });
      throw error;
    }
  }

  async updateTask(id, updateData, userId) {
    try {
      const { title, description, status, priority, dueDate, categoryId } = updateData;

      // Verifica se a tarefa existe e se o usuário pode editá-la
      const existingTask = await this.taskRepository.findById(id);
      if (!existingTask) {
        throw new Error('Tarefa não encontrada');
      }

      const belongsToUser = await this.taskRepository.belongsToUser(id, userId);
      if (!belongsToUser) {
        throw new Error('Você não tem permissão para editar esta tarefa');
      }

      // Valida categoria se fornecida
      if (categoryId) {
        const categoryExists = await this.categoryRepository.existsById(categoryId);
        if (!categoryExists) {
          throw new Error('Categoria não encontrada');
        }

        const categoryBelongsToUser = await this.categoryRepository.belongsToUser(categoryId, userId);
        if (!categoryBelongsToUser) {
          throw new Error('Categoria não pertence ao usuário');
        }
      }

      // Valida status
      if (status && !Object.values(TaskStatus).includes(status)) {
        throw new Error('Status inválido');
      }

      // Valida prioridade
      if (priority && !Object.values(Priority).includes(priority)) {
        throw new Error('Prioridade inválida');
      }

      // Valida data de vencimento
      if (dueDate && new Date(dueDate) < new Date() && status !== TaskStatus.COMPLETED) {
        throw new Error('Data de vencimento deve ser futura para tarefas não concluídas');
      }

      const dataToUpdate = {};
      if (title) dataToUpdate.title = title;
      if (description !== undefined) dataToUpdate.description = description;
      if (status) dataToUpdate.status = status;
      if (priority) dataToUpdate.priority = priority;
      if (dueDate !== undefined) dataToUpdate.dueDate = dueDate ? new Date(dueDate) : null;
      if (categoryId !== undefined) dataToUpdate.categoryId = categoryId;

      const updatedTask = await this.taskRepository.update(id, dataToUpdate);

      logger.info('Tarefa atualizada', { taskId: id, userId });

      return updatedTask;
    } catch (error) {
      logger.error('Erro ao atualizar tarefa', {
        error: error.message,
        id,
        updateData,
        userId
      });
      throw error;
    }
  }

  async deleteTask(id, userId) {
    try {
      // Verifica se a tarefa existe e pertence ao usuário
      const existingTask = await this.taskRepository.findById(id);
      if (!existingTask) {
        throw new Error('Tarefa não encontrada');
      }

      const belongsToUser = await this.taskRepository.belongsToUser(id, userId);
      if (!belongsToUser) {
        throw new Error('Você não tem permissão para deletar esta tarefa');
      }

      await this.taskRepository.delete(id);

      logger.info('Tarefa deletada', { taskId: id, userId });

      return true;
    } catch (error) {
      logger.error('Erro ao deletar tarefa', { error: error.message, id, userId });
      throw error;
    }
  }

  async assignTask(taskId, assigneeId, userId) {
    try {
      // Verifica se a tarefa existe e se o usuário pode atribuí-la
      const task = await this.taskRepository.findById(taskId);
      if (!task) {
        throw new Error('Tarefa não encontrada');
      }

      const belongsToUser = await this.taskRepository.belongsToUser(taskId, userId);
      if (!belongsToUser) {
        throw new Error('Você não tem permissão para atribuir esta tarefa');
      }

      // Verifica se o usuário a ser atribuído existe
      const assigneeExists = await this.userRepository.existsById(assigneeId);
      if (!assigneeExists) {
        throw new Error('Usuário não encontrado');
      }

      const assignedUser = await this.taskRepository.assignUser(taskId, assigneeId);

      logger.info('Tarefa atribuída', { taskId, assigneeId, userId });

      return assignedUser;
    } catch (error) {
      logger.error('Erro ao atribuir tarefa', {
        error: error.message,
        taskId,
        assigneeId,
        userId
      });
      throw error;
    }
  }

  async unassignTask(taskId, assigneeId, userId) {
    try {
      // Verifica se a tarefa existe e se o usuário pode desatribuí-la
      const task = await this.taskRepository.findById(taskId);
      if (!task) {
        throw new Error('Tarefa não encontrada');
      }

      const belongsToUser = await this.taskRepository.belongsToUser(taskId, userId);
      if (!belongsToUser) {
        throw new Error('Você não tem permissão para desatribuir esta tarefa');
      }

      await this.taskRepository.unassignUser(taskId, assigneeId);

      logger.info('Tarefa desatribuída', { taskId, assigneeId, userId });

      return true;
    } catch (error) {
      logger.error('Erro ao desatribuir tarefa', {
        error: error.message,
        taskId,
        assigneeId,
        userId
      });
      throw error;
    }
  }

  async addCollaborator(taskId, collaboratorId, role, userId) {
    try {
      // Verifica se a tarefa existe e se o usuário pode adicionar colaboradores
      const task = await this.taskRepository.findById(taskId);
      if (!task) {
        throw new Error('Tarefa não encontrada');
      }

      const belongsToUser = await this.taskRepository.belongsToUser(taskId, userId);
      if (!belongsToUser) {
        throw new Error('Você não tem permissão para adicionar colaboradores nesta tarefa');
      }

      // Verifica se o colaborador existe
      const collaboratorExists = await this.userRepository.existsById(collaboratorId);
      if (!collaboratorExists) {
        throw new Error('Usuário não encontrado');
      }

      const collaborator = await this.taskRepository.addCollaborator(taskId, collaboratorId, role);

      logger.info('Colaborador adicionado', { taskId, collaboratorId, role, userId });

      return collaborator;
    } catch (error) {
      logger.error('Erro ao adicionar colaborador', {
        error: error.message,
        taskId,
        collaboratorId,
        role,
        userId
      });
      throw error;
    }
  }

  async removeCollaborator(taskId, collaboratorId, userId) {
    try {
      // Verifica se a tarefa existe e se o usuário pode remover colaboradores
      const task = await this.taskRepository.findById(taskId);
      if (!task) {
        throw new Error('Tarefa não encontrada');
      }

      const belongsToUser = await this.taskRepository.belongsToUser(taskId, userId);
      if (!belongsToUser) {
        throw new Error('Você não tem permissão para remover colaboradores desta tarefa');
      }

      await this.taskRepository.removeCollaborator(taskId, collaboratorId);

      logger.info('Colaborador removido', { taskId, collaboratorId, userId });

      return true;
    } catch (error) {
      logger.error('Erro ao remover colaborador', {
        error: error.message,
        taskId,
        collaboratorId,
        userId
      });
      throw error;
    }
  }

  async getUserTasks(userId, options = {}) {
    try {
      const { page, limit, skip } = PaginationUtils.getPaginationData(options.page, options.limit);

      const result = await this.taskRepository.findAll({
        ...options,
        userId,
        page,
        limit,
        skip
      });

      const pagination = PaginationUtils.getPaginationInfo(page, limit, result.total);

      logger.info('Tarefas do usuário listadas', {
        userId,
        total: result.total,
        page,
        limit
      });

      return {
        tasks: result.tasks,
        pagination
      };
    } catch (error) {
      logger.error('Erro ao listar tarefas do usuário', {
        error: error.message,
        userId,
        options
      });
      throw error;
    }
  }

  async getTasksByStatus(userId, status) {
    try {
      if (!Object.values(TaskStatus).includes(status)) {
        throw new Error('Status inválido');
      }

      const result = await this.taskRepository.findAll({
        userId,
        status
      });

      logger.info('Tarefas por status listadas', { userId, status, total: result.total });

      return result.tasks;
    } catch (error) {
      logger.error('Erro ao listar tarefas por status', {
        error: error.message,
        userId,
        status
      });
      throw error;
    }
  }

  async getOverdueTasks(userId) {
    try {
      const result = await this.taskRepository.findAll({
        userId,
        overdue: true
      });

      logger.info('Tarefas em atraso listadas', { userId, total: result.total });

      return result.tasks;
    } catch (error) {
      logger.error('Erro ao listar tarefas em atraso', {
        error: error.message,
        userId
      });
      throw error;
    }
  }

  async searchTasks(query, userId, options = {}) {
    try {
      const { page, limit, skip } = PaginationUtils.getPaginationData(options.page, options.limit);

      const result = await this.taskRepository.findAll({
        search: query,
        userId,
        page,
        limit,
        skip,
        ...options
      });

      const pagination = PaginationUtils.getPaginationInfo(page, limit, result.total);

      logger.info('Busca de tarefas realizada', {
        query,
        userId,
        total: result.total,
        page,
        limit
      });

      return {
        tasks: result.tasks,
        pagination,
        query
      };
    } catch (error) {
      logger.error('Erro na busca de tarefas', {
        error: error.message,
        query,
        userId,
        options
      });
      throw error;
    }
  }

  async getTaskStats(userId) {
    try {
      const [tasksByStatus, tasksByPriority, overdueTasks] = await Promise.all([
        this.taskRepository.getTasksByStatus(userId),
        this.taskRepository.getTasksByPriority(userId),
        this.taskRepository.getOverdueTasks(userId)
      ]);

      return {
        tasksByStatus,
        tasksByPriority,
        overdueTasks
      };
    } catch (error) {
      logger.error('Erro ao buscar estatísticas de tarefas', {
        error: error.message,
        userId
      });
      throw error;
    }
  }
}
