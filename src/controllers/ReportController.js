import { ReportService } from '../services/ReportService.js';
import { ResponseUtils } from '../utils/response.js';
import logger from '../config/logger.js';

export class ReportController {
  constructor() {
    this.reportService = new ReportService();
  }

  async getTasksByStatusReport(req, res, next) {
    try {
      const { startDate, endDate } = req.validatedData.query;
      const userId = req.user.id;

      const result = await this.reportService.getTasksByStatusReport(userId, {
        startDate,
        endDate
      });

      ResponseUtils.success(res, result, 'Relatório de tarefas por status gerado com sucesso');
    } catch (error) {
      logger.error('Erro ao gerar relatório de tarefas por status', { 
        error: error.message, 
        userId: req.user.id,
        query: req.validatedData.query 
      });
      next(error);
    }
  }

  async getTasksByCategoryReport(req, res, next) {
    try {
      const { startDate, endDate } = req.validatedData.query;
      const userId = req.user.id;

      const result = await this.reportService.getTasksByCategoryReport(userId, {
        startDate,
        endDate
      });

      ResponseUtils.success(res, result, 'Relatório de tarefas por categoria gerado com sucesso');
    } catch (error) {
      logger.error('Erro ao gerar relatório de tarefas por categoria', { 
        error: error.message, 
        userId: req.user.id,
        query: req.validatedData.query 
      });
      next(error);
    }
  }

  async getUserPerformanceReport(req, res, next) {
    try {
      const { startDate, endDate } = req.validatedData.query;
      const userId = req.user.id;

      const result = await this.reportService.getUserPerformanceReport(userId, {
        startDate,
        endDate
      });

      ResponseUtils.success(res, result, 'Relatório de performance do usuário gerado com sucesso');
    } catch (error) {
      logger.error('Erro ao gerar relatório de performance do usuário', { 
        error: error.message, 
        userId: req.user.id,
        query: req.validatedData.query 
      });
      next(error);
    }
  }

  async getProductivityReport(req, res, next) {
    try {
      const { startDate, endDate, groupBy } = req.validatedData.query;
      const userId = req.user.id;

      const result = await this.reportService.getProductivityReport(userId, {
        startDate,
        endDate,
        groupBy
      });

      ResponseUtils.success(res, result, 'Relatório de produtividade gerado com sucesso');
    } catch (error) {
      logger.error('Erro ao gerar relatório de produtividade', { 
        error: error.message, 
        userId: req.user.id,
        query: req.validatedData.query 
      });
      next(error);
    }
  }

  async getCollaborationReport(req, res, next) {
    try {
      const { startDate, endDate } = req.validatedData.query;
      const userId = req.user.id;

      const result = await this.reportService.getCollaborationReport(userId, {
        startDate,
        endDate
      });

      ResponseUtils.success(res, result, 'Relatório de colaboração gerado com sucesso');
    } catch (error) {
      logger.error('Erro ao gerar relatório de colaboração', { 
        error: error.message, 
        userId: req.user.id,
        query: req.validatedData.query 
      });
      next(error);
    }
  }

  async getDashboardData(req, res, next) {
    try {
      const userId = req.user.id;

      const result = await this.reportService.getDashboardData(userId);

      ResponseUtils.success(res, result, 'Dados do dashboard recuperados com sucesso');
    } catch (error) {
      logger.error('Erro ao gerar dados do dashboard', { 
        error: error.message, 
        userId: req.user.id
      });
      next(error);
    }
  }

  async getTasksOverview(req, res, next) {
    try {
      const userId = req.user.id;

      const result = await this.reportService.getTasksByStatusReport(userId);

      ResponseUtils.success(res, result, 'Visão geral das tarefas recuperada com sucesso');
    } catch (error) {
      logger.error('Erro ao gerar visão geral das tarefas', { 
        error: error.message, 
        userId: req.user.id
      });
      next(error);
    }
  }

  async getCategoriesOverview(req, res, next) {
    try {
      const userId = req.user.id;

      const result = await this.reportService.getTasksByCategoryReport(userId);

      ResponseUtils.success(res, result, 'Visão geral das categorias recuperada com sucesso');
    } catch (error) {
      logger.error('Erro ao gerar visão geral das categorias', { 
        error: error.message, 
        userId: req.user.id
      });
      next(error);
    }
  }

  async getPerformanceOverview(req, res, next) {
    try {
      const userId = req.user.id;

      const result = await this.reportService.getUserPerformanceReport(userId);

      ResponseUtils.success(res, result, 'Visão geral da performance recuperada com sucesso');
    } catch (error) {
      logger.error('Erro ao gerar visão geral da performance', { 
        error: error.message, 
        userId: req.user.id
      });
      next(error);
    }
  }

  async getWeeklyProductivity(req, res, next) {
    try {
      const userId = req.user.id;
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const result = await this.reportService.getProductivityReport(userId, {
        startDate: oneWeekAgo.toISOString(),
        endDate: new Date().toISOString(),
        groupBy: 'day'
      });

      ResponseUtils.success(res, result, 'Produtividade semanal recuperada com sucesso');
    } catch (error) {
      logger.error('Erro ao gerar produtividade semanal', { 
        error: error.message, 
        userId: req.user.id
      });
      next(error);
    }
  }

  async getMonthlyProductivity(req, res, next) {
    try {
      const userId = req.user.id;
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

      const result = await this.reportService.getProductivityReport(userId, {
        startDate: oneMonthAgo.toISOString(),
        endDate: new Date().toISOString(),
        groupBy: 'week'
      });

      ResponseUtils.success(res, result, 'Produtividade mensal recuperada com sucesso');
    } catch (error) {
      logger.error('Erro ao gerar produtividade mensal', { 
        error: error.message, 
        userId: req.user.id
      });
      next(error);
    }
  }

  async getCustomReport(req, res, next) {
    try {
      const { 
        reportType, 
        startDate, 
        endDate, 
        groupBy 
      } = req.validatedData.body;
      const userId = req.user.id;

      let result;

      switch (reportType) {
        case 'status':
          result = await this.reportService.getTasksByStatusReport(userId, {
            startDate,
            endDate
          });
          break;
        case 'category':
          result = await this.reportService.getTasksByCategoryReport(userId, {
            startDate,
            endDate
          });
          break;
        case 'performance':
          result = await this.reportService.getUserPerformanceReport(userId, {
            startDate,
            endDate
          });
          break;
        case 'productivity':
          result = await this.reportService.getProductivityReport(userId, {
            startDate,
            endDate,
            groupBy
          });
          break;
        case 'collaboration':
          result = await this.reportService.getCollaborationReport(userId, {
            startDate,
            endDate
          });
          break;
        default:
          return ResponseUtils.validationError(res, [
            { field: 'reportType', message: 'Tipo de relatório inválido' }
          ]);
      }

      ResponseUtils.success(res, result, `Relatório ${reportType} customizado gerado com sucesso`);
    } catch (error) {
      logger.error('Erro ao gerar relatório customizado', { 
        error: error.message, 
        userId: req.user.id,
        body: req.validatedData.body 
      });
      next(error);
    }
  }
}
