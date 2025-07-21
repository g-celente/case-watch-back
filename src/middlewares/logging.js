import morgan from 'morgan';
import logger from '../config/logger.js';
import config from '../config/index.js';

// Função para registrar logs HTTP
const httpLogger = (tokens, req, res) => {
  const logData = {
    method: tokens.method(req, res),
    url: tokens.url(req, res),
    status: parseInt(tokens.status(req, res)),
    responseTime: parseFloat(tokens['response-time'](req, res)),
    contentLength: tokens.res(req, res, 'content-length') || 0,
    userAgent: tokens['user-agent'](req, res),
    ip: tokens['remote-addr'](req, res)
  };

  // Adiciona informações do usuário se disponível
  if (req.user) {
    logData.userId = req.user.id;
    logData.userEmail = req.user.email;
  }

  const message = `${logData.method} ${logData.url} - ${logData.status} - ${logData.responseTime}ms`;

  // Log diferentes níveis baseado no status
  if (logData.status >= 500) {
    logger.error(message, logData);
  } else if (logData.status >= 400) {
    logger.warn(message, logData);
  } else {
    logger.info(message, logData);
  }

  return null; // Morgan não precisa do retorno
};

// Middleware de logging HTTP
export const httpLogging = morgan(httpLogger, {
  stream: {
    write: () => {} // Vazio porque o logger já faz o trabalho
  },
  skip: (req, res) => {
    // Pula logs de health check em produção
    if (config.NODE_ENV === 'production' && req.url === '/health') {
      return true;
    }
    return false;
  }
});

// Middleware para adicionar request ID
export const requestId = (req, res, next) => {
  req.requestId = Math.random().toString(36).substring(2, 15);
  res.setHeader('X-Request-ID', req.requestId);
  next();
};

// Middleware para logging de request/response detalhado
export const detailedLogging = (req, res, next) => {
  const startTime = Date.now();
  
  logger.debug('Request iniciado', {
    requestId: req.requestId,
    method: req.method,
    url: req.url,
    headers: req.headers,
    body: req.body,
    query: req.query,
    params: req.params,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Intercepta o final da response
  const originalEnd = res.end;
  res.end = function(chunk, encoding) {
    const duration = Date.now() - startTime;
    
    logger.debug('Request finalizado', {
      requestId: req.requestId,
      statusCode: res.statusCode,
      duration,
      headers: res.getHeaders()
    });

    originalEnd.call(res, chunk, encoding);
  };

  next();
};
