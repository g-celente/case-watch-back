import { AuthService } from '../services/AuthService.js';
import { ResponseUtils } from '../utils/response.js';
import { logger } from '../utils/logger.js';

export class AuthController {
  constructor() {
    this.authService = new AuthService();
  }

  async register(req, res, next) {
    try {
      const { email, password, name } = req.validatedData.body;

      const result = await this.authService.register({
        email,
        password,
        name
      });

      if (result.error) {
        return ResponseUtils.error(res, result.message, result.statusCode || 500);
      }

      logger.info('Usuário registrado com sucesso', { 
        userId: result.user.id, 
        email: result.user.email 
      });

      ResponseUtils.success(res, result, 'Usuário registrado com sucesso', 201);
    } catch (error) {
      logger.error('Erro no registro', { 
        error: error.message, 
        email: req.validatedData.body.email 
      });
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.validatedData.body;

      const result = await this.authService.login({
        email,
        password
      });

      if (result.error) {
        return ResponseUtils.error(res, result.message, result.statusCode || 500);
      }

      logger.info('Login realizado com sucesso', { 
        userId: result.user.id, 
        email: result.user.email 
      });

      ResponseUtils.success(res, result, 'Login realizado com sucesso');
    } catch (error) {
      logger.error('Erro no login', { 
        error: error.message, 
        email: req.validatedData.body.email 
      });
      next(error);
    }
  }

  async getProfile(req, res, next) {
    try {
      const userId = req.user.id;

      const result = await this.authService.getProfile(userId);

      ResponseUtils.success(res, result, 'Perfil recuperado com sucesso');
    } catch (error) {
      logger.error('Erro ao buscar perfil', { 
        error: error.message, 
        userId: req.user.id 
      });
      next(error);
    }
  }

  async updateProfile(req, res, next) {
    try {
      const userId = req.user.id;
      const { email, name, avatar } = req.validatedData.body;

      const result = await this.authService.updateProfile(userId, {
        email,
        name,
        avatar
      });

      logger.info('Perfil atualizado com sucesso', { userId });

      ResponseUtils.success(res, result, 'Perfil atualizado com sucesso');
    } catch (error) {
      logger.error('Erro ao atualizar perfil', { 
        error: error.message, 
        userId: req.user.id 
      });
      next(error);
    }
  }

  async changePassword(req, res, next) {
    try {
      const userId = req.user.id;
      const { currentPassword, newPassword } = req.validatedData.body;

      await this.authService.changePassword(userId, {
        currentPassword,
        newPassword
      });

      logger.info('Senha alterada com sucesso', { userId });

      ResponseUtils.success(res, null, 'Senha alterada com sucesso');
    } catch (error) {
      logger.error('Erro ao alterar senha', { 
        error: error.message, 
        userId: req.user.id 
      });
      next(error);
    }
  }

  async refreshToken(req, res, next) {
    try {
      const userId = req.user.id;

      const result = await this.authService.refreshToken(userId);

      logger.info('Token renovado com sucesso', { userId });

      ResponseUtils.success(res, result, 'Token renovado com sucesso');
    } catch (error) {
      logger.error('Erro ao renovar token', { 
        error: error.message, 
        userId: req.user.id 
      });
      next(error);
    }
  }

  async logout(req, res, next) {
    try {
      // Em JWT stateless, o logout é feito no frontend removendo o token
      // Aqui podemos apenas logar a ação
      logger.info('Logout realizado', { userId: req.user.id });

      ResponseUtils.success(res, null, 'Logout realizado com sucesso');
    } catch (error) {
      logger.error('Erro no logout', { 
        error: error.message, 
        userId: req.user.id 
      });
      next(error);
    }
  }
}
