import { Router } from 'express';
import { CategoryController } from '../controllers/CategoryController.js';
import { validate } from '../middlewares/validation.js';
import { authMiddleware } from '../middlewares/auth.js';
import { createResourceRateLimit } from '../middlewares/rateLimit.js';
import { categorySchemas } from './schemas.js';

const router = Router();
const categoryController = new CategoryController();

/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: Gerenciamento de categorias
 */

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Listar categorias do usuário
 *     tags: [Categories]
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
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, updatedAt, name]
 *           default: createdAt
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *     responses:
 *       200:
 *         description: Lista de categorias
 *       401:
 *         description: Token inválido ou expirado
 */
router.get('/',
  authMiddleware,
  validate(categorySchemas.categoryPaginationQuery),
  categoryController.getCategories.bind(categoryController)
);

/**
 * @swagger
 * /api/categories:
 *   post:
 *     summary: Criar nova categoria
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 maxLength: 100
 *               description:
 *                 type: string
 *                 maxLength: 500
 *               color:
 *                 type: string
 *                 pattern: '^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$'
 *     responses:
 *       201:
 *         description: Categoria criada com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Token inválido ou expirado
 *       409:
 *         description: Categoria com este nome já existe
 */
router.post('/',
  authMiddleware,
  createResourceRateLimit,
  validate(categorySchemas.createCategory),
  categoryController.createCategory.bind(categoryController)
);

/**
 * @swagger
 * /api/categories/my:
 *   get:
 *     summary: Listar todas as categorias do usuário atual
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, updatedAt, name]
 *           default: createdAt
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *     responses:
 *       200:
 *         description: Lista de categorias do usuário
 *       401:
 *         description: Token inválido ou expirado
 */
router.get('/my',
  authMiddleware,
  validate(categorySchemas.categoryPaginationQuery),
  categoryController.getUserCategories.bind(categoryController)
);

/**
 * @swagger
 * /api/categories/search:
 *   get:
 *     summary: Buscar categorias
 *     tags: [Categories]
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
  validate(categorySchemas.categoryPaginationQuery),
  categoryController.searchCategories.bind(categoryController)
);

/**
 * @swagger
 * /api/categories/stats:
 *   get:
 *     summary: Obter categorias com estatísticas
 *     tags: [Categories]
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
 *     responses:
 *       200:
 *         description: Categorias com estatísticas
 *       401:
 *         description: Token inválido ou expirado
 */
router.get('/stats',
  authMiddleware,
  validate(categorySchemas.categoryPaginationQuery),
  categoryController.getCategoriesWithStats.bind(categoryController)
);

/**
 * @swagger
 * /api/categories/{id}:
 *   get:
 *     summary: Obter categoria por ID
 *     tags: [Categories]
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
 *         description: Dados da categoria
 *       404:
 *         description: Categoria não encontrada
 *       401:
 *         description: Token inválido ou expirado
 *       403:
 *         description: Acesso negado
 */
router.get('/:id',
  authMiddleware,
  validate(categorySchemas.getCategoryById),
  categoryController.getCategoryById.bind(categoryController)
);

/**
 * @swagger
 * /api/categories/{id}:
 *   put:
 *     summary: Atualizar categoria
 *     tags: [Categories]
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
 *               name:
 *                 type: string
 *                 maxLength: 100
 *               description:
 *                 type: string
 *                 maxLength: 500
 *               color:
 *                 type: string
 *                 pattern: '^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$'
 *     responses:
 *       200:
 *         description: Categoria atualizada com sucesso
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Categoria não encontrada
 *       401:
 *         description: Token inválido ou expirado
 *       403:
 *         description: Acesso negado
 */
router.put('/:id',
  authMiddleware,
  validate(categorySchemas.updateCategory),
  categoryController.updateCategory.bind(categoryController)
);

/**
 * @swagger
 * /api/categories/{id}:
 *   delete:
 *     summary: Deletar categoria
 *     tags: [Categories]
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
 *         description: Categoria deletada com sucesso
 *       404:
 *         description: Categoria não encontrada
 *       401:
 *         description: Token inválido ou expirado
 *       403:
 *         description: Acesso negado
 *       409:
 *         description: Categoria tem tarefas associadas
 */
router.delete('/:id',
  authMiddleware,
  validate(categorySchemas.deleteCategory),
  categoryController.deleteCategory.bind(categoryController)
);

/**
 * @swagger
 * /api/categories/{id}/stats:
 *   get:
 *     summary: Obter estatísticas da categoria
 *     tags: [Categories]
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
 *         description: Estatísticas da categoria
 *       404:
 *         description: Categoria não encontrada
 *       401:
 *         description: Token inválido ou expirado
 *       403:
 *         description: Acesso negado
 */
router.get('/:id/stats',
  authMiddleware,
  validate(categorySchemas.getCategoryStats),
  categoryController.getCategoryStats.bind(categoryController)
);

export default router;
