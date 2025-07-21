import { Router } from 'express';
import { UserController } from '../controllers/UserController.js';
import { validate } from '../middlewares/validation.js';
import { authMiddleware } from '../middlewares/auth.js';
import { userSchemas } from './schemas.js';

const router = Router();
const userController = new UserController();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Gerenciamento de usuários
 */

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Listar usuários
 *     tags: [Users]
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
 *           enum: [createdAt, updatedAt, name, email]
 *           default: createdAt
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *     responses:
 *       200:
 *         description: Lista de usuários
 *       401:
 *         description: Token inválido ou expirado
 */
router.get('/',
  authMiddleware,
  validate(userSchemas.paginationQuery),
  userController.getUsers.bind(userController)
);

/**
 * @swagger
 * /api/users/me:
 *   get:
 *     summary: Obter dados do usuário atual
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dados do usuário atual
 *       401:
 *         description: Token inválido ou expirado
 */
router.get('/me',
  authMiddleware,
  userController.getCurrentUser.bind(userController)
);

/**
 * @swagger
 * /api/users/me:
 *   put:
 *     summary: Atualizar dados do usuário atual
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               name:
 *                 type: string
 *               avatar:
 *                 type: string
 *                 format: uri
 *     responses:
 *       200:
 *         description: Usuário atualizado com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Token inválido ou expirado
 */
router.put('/me',
  authMiddleware,
  validate(userSchemas.updateUser),
  userController.updateCurrentUser.bind(userController)
);

/**
 * @swagger
 * /api/users/me:
 *   delete:
 *     summary: Deletar conta do usuário atual
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Conta deletada com sucesso
 *       401:
 *         description: Token inválido ou expirado
 */
router.delete('/me',
  authMiddleware,
  userController.deleteCurrentUser.bind(userController)
);

/**
 * @swagger
 * /api/users/me/stats:
 *   get:
 *     summary: Obter estatísticas do usuário atual
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estatísticas do usuário
 *       401:
 *         description: Token inválido ou expirado
 */
router.get('/me/stats',
  authMiddleware,
  userController.getCurrentUserStats.bind(userController)
);

/**
 * @swagger
 * /api/users/search:
 *   get:
 *     summary: Buscar usuários
 *     tags: [Users]
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
  validate(userSchemas.paginationQuery),
  userController.searchUsers.bind(userController)
);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Obter usuário por ID
 *     tags: [Users]
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
 *         description: Dados do usuário
 *       404:
 *         description: Usuário não encontrado
 *       401:
 *         description: Token inválido ou expirado
 */
router.get('/:id',
  authMiddleware,
  validate(userSchemas.getUserById),
  userController.getUserById.bind(userController)
);

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Atualizar usuário
 *     tags: [Users]
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
 *               email:
 *                 type: string
 *                 format: email
 *               name:
 *                 type: string
 *               avatar:
 *                 type: string
 *                 format: uri
 *     responses:
 *       200:
 *         description: Usuário atualizado com sucesso
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Usuário não encontrado
 *       401:
 *         description: Token inválido ou expirado
 */
router.put('/:id',
  authMiddleware,
  validate(userSchemas.updateUser),
  userController.updateUser.bind(userController)
);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Deletar usuário
 *     tags: [Users]
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
 *         description: Usuário deletado com sucesso
 *       404:
 *         description: Usuário não encontrado
 *       401:
 *         description: Token inválido ou expirado
 */
router.delete('/:id',
  authMiddleware,
  validate(userSchemas.deleteUser),
  userController.deleteUser.bind(userController)
);

/**
 * @swagger
 * /api/users/{id}/stats:
 *   get:
 *     summary: Obter estatísticas do usuário
 *     tags: [Users]
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
 *         description: Estatísticas do usuário
 *       404:
 *         description: Usuário não encontrado
 *       401:
 *         description: Token inválido ou expirado
 */
router.get('/:id/stats',
  authMiddleware,
  validate(userSchemas.getUserStats),
  userController.getUserStats.bind(userController)
);

export default router;
