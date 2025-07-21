export const cleanHeaders = (req, res, next) => {
  // Para requisições GET sem body, remover Content-Length
  if (req.method === 'GET' && (!req.body || Object.keys(req.body).length === 0)) {
    delete req.headers['content-length'];
    delete req.headers['Content-Length'];
  }

  // Para requisições OPTIONS, também limpar
  if (req.method === 'OPTIONS') {
    delete req.headers['content-length'];
    delete req.headers['Content-Length'];
  }

  next();
};