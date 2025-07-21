import jwt from 'jsonwebtoken';
import config from '../config/index.js';

export class JwtUtils {
  static generateToken(payload) {
    return jwt.sign(payload, config.JWT_SECRET, {
      expiresIn: config.JWT_EXPIRES_IN
    });
  }

  static verifyToken(token) {
    try {
      return jwt.verify(token, config.JWT_SECRET);
    } catch (error) {
      throw new Error('Token inválido');
    }
  }

  static decodeToken(token) {
    return jwt.decode(token);
  }
}
