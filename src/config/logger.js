import winston from 'winston';
import config from './index.js';

const { combine, timestamp, errors, json, colorize, printf } = winston.format;

// Formato personalizado para desenvolvimento
const devFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} [${level}]: ${stack || message}`;
});

// Configuração do logger
const logger = winston.createLogger({
  level: config.LOG_LEVEL,
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    errors({ stack: true }),
    config.NODE_ENV === 'development' 
      ? combine(colorize(), devFormat)
      : json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error',
      format: json()
    }),
    new winston.transports.File({ 
      filename: 'logs/combined.log',
      format: json()
    })
  ]
});

// Exportar tanto como default quanto como named export
export { logger };
export default logger;
