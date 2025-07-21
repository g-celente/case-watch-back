import { UserRepository } from '../repositories/UserRepository.js';
import { PasswordUtils } from '../utils/password.js';
import { JwtUtils } from '../utils/jwt.js';
import logger from '../config/logger.js';

export class AuthService {
  constructor() {
    this.userRepository = new UserRepository();
  }

  async register(userData) {
    try {
      const { email, password, name } = userData;

      // Verifica se o email já existe
      const existingUser = await this.userRepository.findByEmail(email);
      if (existingUser) {
        return {
          error: true,
          message: 'Email já cadastrado',
          statusCode: 400
        };
      }

      // Valida a senha
      if (!PasswordUtils.validate(password)) {
        return {
          error: true,
          message: 'Senha deve ter pelo menos 8 caracteres, incluindo uma letra maiúscula, uma minúscula e um número',
          statusCode: 400
        };
      }

      // Criptografa a senha
      const hashedPassword = await PasswordUtils.hash(password);

      // Cria o usuário
      const user = await this.userRepository.create({
        email,
        name,
        password: hashedPassword
      });

      // Gera o token
      const token = JwtUtils.generateToken({
        userId: user.id,
        email: user.email,
        name: user.name
      });

      logger.info('Usuário registrado com sucesso', { userId: user.id, email: user.email });

      return {
        user: user.toJSON(),
        token
      };
    } catch (error) {
      logger.error('Erro no registro do usuário', { error: error.message, userData });
      throw error;
    }
  }

  async login(credentials) {
    try {
      const { email, password } = credentials;

      // Busca o usuário
      const user = await this.userRepository.findByEmail(email);
      if (!user) {
        return {
          error: true,
          message: 'Email não encontrado no sistema',
          statusCode: 404
        };
      }

      // Verifica a senha
      const isValidPassword = await PasswordUtils.compare(password, user.password);
      if (!isValidPassword) {
        return {
          error: true,
          message: 'Senha do usuário incorreta',
          statusCode: 401
        };
      }

      // Gera o token
      const token = JwtUtils.generateToken({
        userId: user.id,
        email: user.email,
        name: user.name
      });

      logger.info('Usuário logado com sucesso', { userId: user.id, email: user.email });

      return {
        user: user.toJSON(),
        token
      };
    } catch (error) {
      logger.error('Erro no login do usuário', { error: error.message, email: credentials.email });
      throw error;
    }
  }

  async getProfile(userId) {
    try {
      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new Error('Usuário não encontrado');
      }

      const tasksCount = await this.userRepository.getTasksCount(userId);

      return {
        user: user.toJSON(),
        stats: tasksCount
      };
    } catch (error) {
      logger.error('Erro ao buscar perfil do usuário', { error: error.message, userId });
      throw error;
    }
  }

  async updateProfile(userId, updateData) {
    try {
      const { email, name, password, avatar } = updateData;

      // Verifica se o usuário existe
      const existingUser = await this.userRepository.findById(userId);
      if (!existingUser) {
        throw new Error('Usuário não encontrado');
      }

      // Verifica se o email já está em uso por outro usuário
      if (email && email !== existingUser.email) {
        const emailExists = await this.userRepository.existsByEmail(email, userId);
        if (emailExists) {
          throw new Error('Email já está em uso');
        }
      }

      const dataToUpdate = {};
      
      if (email) dataToUpdate.email = email;
      if (name) dataToUpdate.name = name;
      if (avatar) dataToUpdate.avatar = avatar;

      // Se a senha foi fornecida, valida e criptografa
      if (password) {
        if (!PasswordUtils.validate(password)) {
          throw new Error('Senha deve ter pelo menos 8 caracteres, incluindo uma letra maiúscula, uma minúscula e um número');
        }
        dataToUpdate.password = await PasswordUtils.hash(password);
      }

      const updatedUser = await this.userRepository.update(userId, dataToUpdate);

      logger.info('Perfil do usuário atualizado', { userId });

      return updatedUser.toJSON();
    } catch (error) {
      logger.error('Erro ao atualizar perfil do usuário', { 
        error: error.message, 
        userId, 
        updateData 
      });
      throw error;
    }
  }

  async changePassword(userId, passwordData) {
    try {
      const { currentPassword, newPassword } = passwordData;

      // Busca o usuário
      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new Error('Usuário não encontrado');
      }
      // Verifica a senha atual
      const isValidPassword = await PasswordUtils.compare(currentPassword, user.password);
      if (!isValidPassword) {
        throw new Error('Senha atual incorreta');
      }

      // Valida a nova senha
      if (!PasswordUtils.validate(newPassword)) {
        throw new Error('Nova senha deve ter pelo menos 8 caracteres, incluindo uma letra maiúscula, uma minúscula e um número');
      }

      // Criptografa a nova senha
      const hashedPassword = await PasswordUtils.hash(newPassword);

      // Atualiza a senha
      await this.userRepository.update(userId, { password: hashedPassword });

      logger.info('Senha alterada com sucesso', { userId });

      return true;
    } catch (error) {
      logger.error('Erro ao alterar senha', { error: error.message, userId });
      throw error;
    }
  }

  async refreshToken(userId) {
    try {
      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new Error('Usuário não encontrado');
      }

      const token = JwtUtils.generateToken({
        userId: user.id,
        email: user.email,
        name: user.name
      });

      logger.info('Token atualizado', { userId });

      return { token };
    } catch (error) {
      logger.error('Erro ao atualizar token', { error: error.message, userId });
      throw error;
    }
  }
}
