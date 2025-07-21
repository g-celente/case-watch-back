import { TaskService } from '../services/TaskService.js';
import { ResponseUtils } from '../utils/response.js';
import logger from '../config/logger.js';

export class TaskController {
  constructor() {
    this.taskService = new TaskService();
  }

  async getTasks(req, res, next) {
    try {
      const { 
        page, 
        limit, 
        search, 
        status, 
        priority, 
        categoryId,
        assigneeId,
        overdue,
        sortBy, 
        sortOrder 
      } = req.validatedData.query;
      const userId = req.user.id;

      const result = await this.taskService.getTasks({
        page,
        limit,
        search,
        userId,
        status,
        priority,
        categoryId,
        assigneeId,
        overdue,
        sortBy,
        sortOrder
      });

      ResponseUtils.paginated(res, result.tasks, result.pagination, 'Tarefas recuperadas com sucesso');
    } catch (error) {
      logger.error('Erro ao listar tarefas', { 
        error: error.message, 
        userId: req.user.id,
        query: req.validatedData.query 
      });
      next(error);
    }
  }

  async getTaskById(req, res, next) {
    try {
      const { id } = req.validatedData.params;
      const userId = req.user.id;

      const task = await this.taskService.getTaskById(id, userId);

      ResponseUtils.success(res, task, 'Tarefa recuperada com sucesso');
    } catch (error) {
      logger.error('Erro ao buscar tarefa', { 
        error: error.message, 
        id: req.validatedData.params.id,
        userId: req.user.id
      });
      next(error);
    }
  }

  async createTask(req, res, next) {
    try {
      const { title, description, priority, dueDate, categoryId, assigneeId, collaborators } = req.validatedData.body;
      const userId = req.user.id;

      const task = await this.taskService.createTask({
        title,
        description,
        priority,
        dueDate,
        categoryId,
        ownerId: userId,
        assigneeId,
        collaborators: collaborators || []
      });

      logger.info('Tarefa criada com sucesso', { 
        taskId: task.id,
        userId 
      });

      ResponseUtils.success(res, task, 'Tarefa criada com sucesso', 201);
    } catch (error) {
      logger.error('Erro ao criar tarefa', { 
        error: error.message, 
        userId: req.user.id,
        body: req.validatedData.body 
      });
      next(error);
    }
  }

  async updateTask(req, res, next) {
    try {
      const { id } = req.validatedData.params;
      const { title, description, status, priority, dueDate, categoryId } = req.validatedData.body;
      const userId = req.user.id;

      const task = await this.taskService.updateTask(id, {
        title,
        description,
        status,
        priority,
        dueDate,
        categoryId
      }, userId);

      logger.info('Tarefa atualizada com sucesso', { 
        taskId: id,
        userId 
      });

      ResponseUtils.success(res, task, 'Tarefa atualizada com sucesso');
    } catch (error) {
      logger.error('Erro ao atualizar tarefa', { 
        error: error.message, 
        id: req.validatedData.params.id,
        userId: req.user.id
      });
      next(error);
    }
  }

  async deleteTask(req, res, next) {
    try {
      const { id } = req.validatedData.params;
      const userId = req.user.id;

      await this.taskService.deleteTask(id, userId);

      logger.info('Tarefa deletada com sucesso', { 
        taskId: id,
        userId 
      });

      ResponseUtils.success(res, null, 'Tarefa deletada com sucesso');
    } catch (error) {
      logger.error('Erro ao deletar tarefa', { 
        error: error.message, 
        id: req.validatedData.params.id,
        userId: req.user.id
      });
      next(error);
    }
  }

  async assignTask(req, res, next) {
    try {
      const { id } = req.validatedData.params;
      const { userId: assigneeId } = req.validatedData.body;
      const userId = req.user.id;

      const assignedUser = await this.taskService.assignTask(id, assigneeId, userId);

      logger.info('Tarefa atribuída com sucesso', { 
        taskId: id,
        assigneeId,
        userId 
      });

      ResponseUtils.success(res, assignedUser, 'Tarefa atribuída com sucesso');
    } catch (error) {
      logger.error('Erro ao atribuir tarefa', { 
        error: error.message, 
        id: req.validatedData.params.id,
        userId: req.user.id
      });
      next(error);
    }
  }

  async unassignTask(req, res, next) {
    try {
      const { id } = req.validatedData.params;
      const { userId: assigneeId } = req.validatedData.body;
      const userId = req.user.id;

      await this.taskService.unassignTask(id, assigneeId, userId);

      logger.info('Tarefa desatribuída com sucesso', { 
        taskId: id,
        assigneeId,
        userId 
      });

      ResponseUtils.success(res, null, 'Tarefa desatribuída com sucesso');
    } catch (error) {
      logger.error('Erro ao desatribuir tarefa', { 
        error: error.message, 
        id: req.validatedData.params.id,
        userId: req.user.id
      });
      next(error);
    }
  }

  async addCollaborator(req, res, next) {
    try {
      const { id } = req.validatedData.params;
      const { userId: collaboratorId, role } = req.validatedData.body;
      const userId = req.user.id;

      const collaborator = await this.taskService.addCollaborator(id, collaboratorId, role, userId);

      logger.info('Colaborador adicionado com sucesso', { 
        taskId: id,
        collaboratorId,
        role,
        userId 
      });

      ResponseUtils.success(res, collaborator, 'Colaborador adicionado com sucesso');
    } catch (error) {
      logger.error('Erro ao adicionar colaborador', { 
        error: error.message, 
        id: req.validatedData.params.id,
        userId: req.user.id
      });
      next(error);
    }
  }

  async removeCollaborator(req, res, next) {
    try {
      const { id } = req.validatedData.params;
      const { userId: collaboratorId } = req.validatedData.body;
      const userId = req.user.id;

      await this.taskService.removeCollaborator(id, collaboratorId, userId);

      logger.info('Colaborador removido com sucesso', { 
        taskId: id,
        collaboratorId,
        userId 
      });

      ResponseUtils.success(res, null, 'Colaborador removido com sucesso');
    } catch (error) {
      logger.error('Erro ao remover colaborador', { 
        error: error.message, 
        id: req.validatedData.params.id,
        userId: req.user.id
      });
      next(error);
    }
  }

  async getUserTasks(req, res, next) {
    try {
      const { 
        page, 
        limit, 
        search, 
        status, 
        priority, 
        categoryId,
        overdue,
        sortBy, 
        sortOrder 
      } = req.validatedData.query;
      const userId = req.user.id;

      const result = await this.taskService.getUserTasks(userId, {
        page,
        limit,
        search,
        status,
        priority,
        categoryId,
        overdue,
        sortBy,
        sortOrder
      });

      ResponseUtils.paginated(res, result.tasks, result.pagination, 'Tarefas do usuário recuperadas com sucesso');
    } catch (error) {
      logger.error('Erro ao listar tarefas do usuário', { 
        error: error.message, 
        userId: req.user.id,
        query: req.validatedData.query 
      });
      next(error);
    }
  }

  async getTasksByStatus(req, res, next) {
    try {
      const { status } = req.validatedData.params;
      const userId = req.user.id;

      const tasks = await this.taskService.getTasksByStatus(userId, status);

      ResponseUtils.success(res, tasks, `Tarefas com status ${status} recuperadas com sucesso`);
    } catch (error) {
      logger.error('Erro ao buscar tarefas por status', { 
        error: error.message, 
        status: req.validatedData.params.status,
        userId: req.user.id
      });
      next(error);
    }
  }

  async getOverdueTasks(req, res, next) {
    try {
      const userId = req.user.id;

      const tasks = await this.taskService.getOverdueTasks(userId);

      ResponseUtils.success(res, tasks, 'Tarefas em atraso recuperadas com sucesso');
    } catch (error) {
      logger.error('Erro ao buscar tarefas em atraso', { 
        error: error.message, 
        userId: req.user.id
      });
      next(error);
    }
  }

  async searchTasks(req, res, next) {
    try {
      const { 
        page, 
        limit, 
        search, 
        status, 
        priority, 
        categoryId,
        sortBy, 
        sortOrder 
      } = req.validatedData.query;
      const userId = req.user.id;

      if (!search) {
        return ResponseUtils.validation(res, [
          { field: 'search', message: 'Termo de busca é obrigatório' }
        ]);
      }

      const result = await this.taskService.searchTasks(search, userId, {
        page,
        limit,
        status,
        priority,
        categoryId,
        sortBy,
        sortOrder
      });

      ResponseUtils.paginated(res, result.tasks, result.pagination, 'Busca realizada com sucesso');
    } catch (error) {
      logger.error('Erro na busca de tarefas', { 
        error: error.message, 
        userId: req.user.id,
        query: req.validatedData.query 
      });
      next(error);
    }
  }

  async getTaskStats(req, res, next) {
    try {
      const userId = req.user.id;

      const result = await this.taskService.getTaskStats(userId);

      ResponseUtils.success(res, result, 'Estatísticas das tarefas recuperadas com sucesso');
    } catch (error) {
      logger.error('Erro ao buscar estatísticas das tarefas', { 
        error: error.message, 
        userId: req.user.id
      });
      next(error);
    }
  }

  async updateTaskStatus(req, res, next) {
    try {
      const { id } = req.validatedData.params;
      const { status } = req.validatedData.body;
      const userId = req.user.id;

      const task = await this.taskService.updateTask(id, { status }, userId);

      logger.info('Status da tarefa atualizado com sucesso', { 
        taskId: id,
        status,
        userId 
      });

      ResponseUtils.success(res, task, 'Status da tarefa atualizado com sucesso');
    } catch (error) {
      logger.error('Erro ao atualizar status da tarefa', { 
        error: error.message, 
        id: req.validatedData.params.id,
        userId: req.user.id
      });
      next(error);
    }
  }

  async updateTaskPriority(req, res, next) {
    try {
      const { id } = req.validatedData.params;
      const { priority } = req.validatedData.body;
      const userId = req.user.id;

      const task = await this.taskService.updateTask(id, { priority }, userId);

      logger.info('Prioridade da tarefa atualizada com sucesso', { 
        taskId: id,
        priority,
        userId 
      });

      ResponseUtils.success(res, task, 'Prioridade da tarefa atualizada com sucesso');
    } catch (error) {
      logger.error('Erro ao atualizar prioridade da tarefa', { 
        error: error.message, 
        id: req.validatedData.params.id,
        userId: req.user.id
      });
      next(error);
    }
  }
}
