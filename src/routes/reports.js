import { Router } from 'express';
import { ReportController } from '../controllers/ReportController.js';
import { validate } from '../middlewares/validation.js';
import { authMiddleware } from '../middlewares/auth.js';
import { reportSchemas } from './schemas.js';

const router = Router();
const reportController = new ReportController();

/**
 * @swagger
 * tags:
 *   name: Reports
 *   description: Relatórios e análises
 */

/**
 * @swagger
 * /api/reports/dashboard:
 *   get:
 *     summary: Obter dados do dashboard
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dados do dashboard
 *       401:
 *         description: Token inválido ou expirado
 */
router.get('/dashboard',
  authMiddleware,
  reportController.getDashboardData.bind(reportController)
);

/**
 * @swagger
 * /api/reports/tasks-by-status:
 *   get:
 *     summary: Relatório de tarefas por status
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *     responses:
 *       200:
 *         description: Relatório de tarefas por status
 *       401:
 *         description: Token inválido ou expirado
 */
router.get('/tasks-by-status',
  authMiddleware,
  validate(reportSchemas.dateRangeQuery),
  reportController.getTasksByStatusReport.bind(reportController)
);

/**
 * @swagger
 * /api/reports/tasks-by-category:
 *   get:
 *     summary: Relatório de tarefas por categoria
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *     responses:
 *       200:
 *         description: Relatório de tarefas por categoria
 *       401:
 *         description: Token inválido ou expirado
 */
router.get('/tasks-by-category',
  authMiddleware,
  validate(reportSchemas.dateRangeQuery),
  reportController.getTasksByCategoryReport.bind(reportController)
);

/**
 * @swagger
 * /api/reports/user-performance:
 *   get:
 *     summary: Relatório de performance do usuário
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *     responses:
 *       200:
 *         description: Relatório de performance do usuário
 *       401:
 *         description: Token inválido ou expirado
 */
router.get('/user-performance',
  authMiddleware,
  validate(reportSchemas.dateRangeQuery),
  reportController.getUserPerformanceReport.bind(reportController)
);

/**
 * @swagger
 * /api/reports/productivity:
 *   get:
 *     summary: Relatório de produtividade
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: groupBy
 *         schema:
 *           type: string
 *           enum: [day, week, month]
 *           default: day
 *     responses:
 *       200:
 *         description: Relatório de produtividade
 *       401:
 *         description: Token inválido ou expirado
 */
router.get('/productivity',
  authMiddleware,
  validate(reportSchemas.productivityQuery),
  reportController.getProductivityReport.bind(reportController)
);

/**
 * @swagger
 * /api/reports/collaboration:
 *   get:
 *     summary: Relatório de colaboração
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *     responses:
 *       200:
 *         description: Relatório de colaboração
 *       401:
 *         description: Token inválido ou expirado
 */
router.get('/collaboration',
  authMiddleware,
  validate(reportSchemas.dateRangeQuery),
  reportController.getCollaborationReport.bind(reportController)
);

/**
 * @swagger
 * /api/reports/overview/tasks:
 *   get:
 *     summary: Visão geral das tarefas
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Visão geral das tarefas
 *       401:
 *         description: Token inválido ou expirado
 */
router.get('/overview/tasks',
  authMiddleware,
  reportController.getTasksOverview.bind(reportController)
);

/**
 * @swagger
 * /api/reports/overview/categories:
 *   get:
 *     summary: Visão geral das categorias
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Visão geral das categorias
 *       401:
 *         description: Token inválido ou expirado
 */
router.get('/overview/categories',
  authMiddleware,
  reportController.getCategoriesOverview.bind(reportController)
);

/**
 * @swagger
 * /api/reports/overview/performance:
 *   get:
 *     summary: Visão geral da performance
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Visão geral da performance
 *       401:
 *         description: Token inválido ou expirado
 */
router.get('/overview/performance',
  authMiddleware,
  reportController.getPerformanceOverview.bind(reportController)
);

/**
 * @swagger
 * /api/reports/productivity/weekly:
 *   get:
 *     summary: Produtividade semanal
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Produtividade semanal
 *       401:
 *         description: Token inválido ou expirado
 */
router.get('/productivity/weekly',
  authMiddleware,
  reportController.getWeeklyProductivity.bind(reportController)
);

/**
 * @swagger
 * /api/reports/productivity/monthly:
 *   get:
 *     summary: Produtividade mensal
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Produtividade mensal
 *       401:
 *         description: Token inválido ou expirado
 */
router.get('/productivity/monthly',
  authMiddleware,
  reportController.getMonthlyProductivity.bind(reportController)
);

/**
 * @swagger
 * /api/reports/custom:
 *   post:
 *     summary: Gerar relatório customizado
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reportType
 *             properties:
 *               reportType:
 *                 type: string
 *                 enum: [status, category, performance, productivity, collaboration]
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               endDate:
 *                 type: string
 *                 format: date-time
 *               groupBy:
 *                 type: string
 *                 enum: [day, week, month]
 *                 default: day
 *     responses:
 *       200:
 *         description: Relatório customizado gerado
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Token inválido ou expirado
 */
router.post('/custom',
  authMiddleware,
  validate(reportSchemas.customReport),
  reportController.getCustomReport.bind(reportController)
);

export default router;
