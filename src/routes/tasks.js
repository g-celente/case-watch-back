import { Router } from 'express';
import { TaskController } from '../controllers/TaskController.js';
import { validate } from '../middlewares/validation.js';
import { authMiddleware } from '../middlewares/auth.js';
import { createResourceRateLimit } from '../middlewares/rateLimit.js';
import { taskSchemas } from './schemas.js';

const router = Router();
const taskController = new TaskController();

/**
 * @swagger
 * tags:
 *   name: Tasks
 *   description: Gerenciamento de tarefas
 */

/**
 * @swagger
 * /api/tasks:
 *   get:
 *     summary: Listar tarefas do usuário
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, IN_PROGRESS, COMPLETED, CANCELLED]
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [LOW, MEDIUM, HIGH, URGENT]
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: string
 *       - in: query
 *         name: assigneeId
 *         schema:
 *           type: string
 *       - in: query
 *         name: overdue
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, updatedAt, title, dueDate, priority]
 *           default: createdAt
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *     responses:
 *       200:
 *         description: Lista de tarefas
 *       401:
 *         description: Token inválido ou expirado
 */
router.get('/',
  authMiddleware,
  validate(taskSchemas.taskPaginationQuery),
  taskController.getTasks.bind(taskController)
);

/**
 * @swagger
 * /api/tasks:
 *   post:
 *     summary: Criar nova tarefa
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *                 maxLength: 200
 *               description:
 *                 type: string
 *                 maxLength: 1000
 *               priority:
 *                 type: string
 *                 enum: [LOW, MEDIUM, HIGH, URGENT]
 *                 default: MEDIUM
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *               categoryId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Tarefa criada com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Token inválido ou expirado
 */
router.post('/',
  authMiddleware,
  createResourceRateLimit,
  validate(taskSchemas.createTask),
  taskController.createTask.bind(taskController)
);

/**
 * @swagger
 * /api/tasks/my:
 *   get:
 *     summary: Listar tarefas do usuário atual
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, IN_PROGRESS, COMPLETED, CANCELLED]
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [LOW, MEDIUM, HIGH, URGENT]
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de tarefas do usuário
 *       401:
 *         description: Token inválido ou expirado
 */
router.get('/my',
  authMiddleware,
  validate(taskSchemas.taskPaginationQuery),
  taskController.getUserTasks.bind(taskController)
);

/**
 * @swagger
 * /api/tasks/search:
 *   get:
 *     summary: Buscar tarefas
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, IN_PROGRESS, COMPLETED, CANCELLED]
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [LOW, MEDIUM, HIGH, URGENT]
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Resultados da busca
 *       400:
 *         description: Termo de busca é obrigatório
 *       401:
 *         description: Token inválido ou expirado
 */
router.get('/search',
  authMiddleware,
  validate(taskSchemas.taskPaginationQuery),
  taskController.searchTasks.bind(taskController)
);

/**
 * @swagger
 * /api/tasks/stats:
 *   get:
 *     summary: Obter estatísticas das tarefas
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estatísticas das tarefas
 *       401:
 *         description: Token inválido ou expirado
 */
router.get('/stats',
  authMiddleware,
  taskController.getTaskStats.bind(taskController)
);

/**
 * @swagger
 * /api/tasks/overdue:
 *   get:
 *     summary: Listar tarefas em atraso
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de tarefas em atraso
 *       401:
 *         description: Token inválido ou expirado
 */
router.get('/overdue',
  authMiddleware,
  taskController.getOverdueTasks.bind(taskController)
);

/**
 * @swagger
 * /api/tasks/status/{status}:
 *   get:
 *     summary: Listar tarefas por status
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: status
 *         required: true
 *         schema:
 *           type: string
 *           enum: [PENDING, IN_PROGRESS, COMPLETED, CANCELLED]
 *     responses:
 *       200:
 *         description: Lista de tarefas com o status especificado
 *       401:
 *         description: Token inválido ou expirado
 */
router.get('/status/:status',
  authMiddleware,
  validate(taskSchemas.getTasksByStatus),
  taskController.getTasksByStatus.bind(taskController)
);

/**
 * @swagger
 * /api/tasks/{id}:
 *   get:
 *     summary: Obter tarefa por ID
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Dados da tarefa
 *       404:
 *         description: Tarefa não encontrada
 *       401:
 *         description: Token inválido ou expirado
 *       403:
 *         description: Acesso negado
 */
router.get('/:id',
  authMiddleware,
  validate(taskSchemas.getTaskById),
  taskController.getTaskById.bind(taskController)
);

/**
 * @swagger
 * /api/tasks/{id}:
 *   put:
 *     summary: Atualizar tarefa
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 maxLength: 200
 *               description:
 *                 type: string
 *                 maxLength: 1000
 *               status:
 *                 type: string
 *                 enum: [PENDING, IN_PROGRESS, COMPLETED, CANCELLED]
 *               priority:
 *                 type: string
 *                 enum: [LOW, MEDIUM, HIGH, URGENT]
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *               categoryId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Tarefa atualizada com sucesso
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Tarefa não encontrada
 *       401:
 *         description: Token inválido ou expirado
 *       403:
 *         description: Acesso negado
 */
router.put('/:id',
  authMiddleware,
  validate(taskSchemas.updateTask),
  taskController.updateTask.bind(taskController)
);

/**
 * @swagger
 * /api/tasks/{id}:
 *   delete:
 *     summary: Deletar tarefa
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Tarefa deletada com sucesso
 *       404:
 *         description: Tarefa não encontrada
 *       401:
 *         description: Token inválido ou expirado
 *       403:
 *         description: Acesso negado
 */
router.delete('/:id',
  authMiddleware,
  validate(taskSchemas.deleteTask),
  taskController.deleteTask.bind(taskController)
);

/**
 * @swagger
 * /api/tasks/{id}/assign:
 *   post:
 *     summary: Atribuir tarefa a um usuário
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Tarefa atribuída com sucesso
 *       404:
 *         description: Tarefa não encontrada
 *       401:
 *         description: Token inválido ou expirado
 *       403:
 *         description: Acesso negado
 */
router.post('/:id/assign',
  authMiddleware,
  validate(taskSchemas.assignTask),
  taskController.assignTask.bind(taskController)
);

/**
 * @swagger
 * /api/tasks/{id}/unassign:
 *   post:
 *     summary: Desatribuir tarefa de um usuário
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Tarefa desatribuída com sucesso
 *       404:
 *         description: Tarefa não encontrada
 *       401:
 *         description: Token inválido ou expirado
 *       403:
 *         description: Acesso negado
 */
router.post('/:id/unassign',
  authMiddleware,
  validate(taskSchemas.assignTask),
  taskController.unassignTask.bind(taskController)
);

/**
 * @swagger
 * /api/tasks/{id}/collaborate:
 *   post:
 *     summary: Adicionar colaborador à tarefa
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [VIEWER, EDITOR, ADMIN]
 *                 default: VIEWER
 *     responses:
 *       200:
 *         description: Colaborador adicionado com sucesso
 *       404:
 *         description: Tarefa não encontrada
 *       401:
 *         description: Token inválido ou expirado
 *       403:
 *         description: Acesso negado
 */
router.post('/:id/collaborate',
  authMiddleware,
  validate(taskSchemas.addCollaborator),
  taskController.addCollaborator.bind(taskController)
);

/**
 * @swagger
 * /api/tasks/{id}/collaborate:
 *   delete:
 *     summary: Remover colaborador da tarefa
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Colaborador removido com sucesso
 *       404:
 *         description: Tarefa não encontrada
 *       401:
 *         description: Token inválido ou expirado
 *       403:
 *         description: Acesso negado
 */
router.delete('/:id/collaborate',
  authMiddleware,
  validate(taskSchemas.removeCollaborator),
  taskController.removeCollaborator.bind(taskController)
);

/**
 * @swagger
 * /api/tasks/{id}/status:
 *   patch:
 *     summary: Atualizar status da tarefa
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [PENDING, IN_PROGRESS, COMPLETED, CANCELLED]
 *     responses:
 *       200:
 *         description: Status da tarefa atualizado com sucesso
 *       404:
 *         description: Tarefa não encontrada
 *       401:
 *         description: Token inválido ou expirado
 *       403:
 *         description: Acesso negado
 */
router.patch('/:id/status',
  authMiddleware,
  validate(taskSchemas.updateTaskStatus),
  taskController.updateTaskStatus.bind(taskController)
);

/**
 * @swagger
 * /api/tasks/{id}/priority:
 *   patch:
 *     summary: Atualizar prioridade da tarefa
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - priority
 *             properties:
 *               priority:
 *                 type: string
 *                 enum: [LOW, MEDIUM, HIGH, URGENT]
 *     responses:
 *       200:
 *         description: Prioridade da tarefa atualizada com sucesso
 *       404:
 *         description: Tarefa não encontrada
 *       401:
 *         description: Token inválido ou expirado
 *       403:
 *         description: Acesso negado
 */
router.patch('/:id/priority',
  authMiddleware,
  validate(taskSchemas.updateTaskPriority),
  taskController.updateTaskPriority.bind(taskController)
);

export default router;
