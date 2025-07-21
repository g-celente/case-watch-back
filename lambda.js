import serverless from "serverless-http";
import app from "./src/index.js";
// Configuração específica para Lambda
if (process.env.NODE_ENV === 'production') {
  // Configurações específicas para produção
  app.set('trust proxy', true);
}

// Wrapper serverless - sem chamar startServer()
export const handler = serverless(app);