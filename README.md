# Case Watch - Backend API Completo

Sistema completo de gerenciamento de tarefas colaborativas construído com Node.js, Express, PostgreSQL e Prisma ORM, seguindo arquitetura MVC e princípios de POO.

## 🚀 Características Principais

- **Arquitetura MVC**: Separação clara de responsabilidades
- **Autenticação JWT**: Sistema seguro de autenticação e autorização
- **Validação Robusta**: Validação de dados com Zod
- **Banco de Dados**: PostgreSQL com Prisma ORM
- **Documentação API**: Swagger/OpenAPI 3.0 completa
- **Testes Abrangentes**: Jest com cobertura de testes
- **Deploy Serverless**: Configurado para AWS Lambda
- **Logs Estruturados**: Winston para logging
- **Rate Limiting**: Proteção contra spam e ataques
- **CORS e Segurança**: Configurações de segurança com Helmet

## ⚙️ Tecnologias Utilizadas

- **Node.js 18+** - Runtime JavaScript com ES Modules
- **Express.js** - Framework web minimalista e flexível
- **PostgreSQL** - Banco de dados relacional robusto
- **Prisma ORM** - ORM moderno com type safety
- **JWT** - Autenticação baseada em tokens seguros
- **Zod** - Validação de esquemas TypeScript-first
- **Jest** - Framework de testes com mocks
- **Docker** - Containerização para desenvolvimento
- **Serverless Framework** - Deploy serverless na AWS
- **Swagger** - Documentação interativa da API
- **Winston** - Sistema de logs estruturado
- **bcryptjs** - Hash de senhas seguro
- **Helmet** - Middleware de segurança

## 🏗️ Arquitetura do Sistema

O projeto implementa uma arquitetura MVC robusta com separação clara de responsabilidades:

```
src/
├── config/          # Configurações (database, logger)
├── controllers/     # Controllers da API (AuthController, TaskController, etc.)
├── entities/        # Entidades de domínio (User, Task, Category)
├── middlewares/     # Middlewares (auth, validation, errorHandler, etc.)
├── repositories/    # Camada de acesso a dados (UserRepository, TaskRepository)
├── routes/          # Definições de rotas com validação
├── services/        # Lógica de negócio (AuthService, TaskService, etc.)
├── utils/           # Utilitários (JwtUtils, PasswordUtils, etc.)
└── index.js         # Ponto de entrada da aplicação

tests/
├── integration/     # Testes de integração da API
├── middlewares/     # Testes de middlewares
├── services/        # Testes de serviços
└── utils/          # Testes de utilitários

prisma/
├── migrations/      # Migrações do banco de dados
├── schema.prisma    # Schema do Prisma
└── seed.js         # Script de seed para dados iniciais
```

## 🔧 Configuração e Instalação

### Pré-requisitos

- Node.js 18+
- Docker e Docker Compose
- AWS CLI (para deploy)

### Instalação Local

1. **Clone o repositório:**
```bash
git clone <repository-url>
cd case-watch-back
```

2. **Instale as dependências:**
```bash
npm install
```

3. **Configure as variáveis de ambiente:**
```bash
cp .env.example .env
# Edite o arquivo .env com suas configurações
```

4. **Suba o banco de dados com Docker:**
```bash
npm run docker:up
```

5. **Execute as migrações do Prisma:**
```bash
npm run prisma:migrate
npm run prisma:generate
```

6. **Inicie a aplicação:**
```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:3000`

## 🐳 Docker

### Executar com Docker Compose

```bash
# Subir todos os serviços
docker-compose up -d

# Parar os serviços
docker-compose down

# Ver logs
docker-compose logs -f app
```

### Comandos úteis

```bash
# Reconstruir containers
docker-compose build

# Executar migrações no container
docker-compose exec app npm run prisma:migrate

# Acessar shell do container
docker-compose exec app sh
```

## 📋 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev              # Inicia em modo desenvolvimento
npm run build            # Compila para produção
npm run start            # Inicia versão compilada

# Banco de dados
npm run prisma:migrate   # Executa migrações
npm run prisma:generate  # Gera cliente Prisma
npm run prisma:studio    # Interface visual do banco
npm run prisma:reset     # Reseta o banco

# Testes
npm test                 # Executa testes
npm run test:watch       # Executa testes em modo watch
npm run test:coverage    # Gera relatório de cobertura

# Deploy
npm run deploy           # Deploy para AWS Lambda
npm run deploy:dev       # Deploy para ambiente dev
npm run deploy:prod      # Deploy para ambiente prod

# Docker
npm run docker:up        # Sobe containers
npm run docker:down      # Para containers
```

## 🔐 Autenticação

A API utiliza JWT (JSON Web Tokens) para autenticação:

1. **Registre-se:** `POST /api/auth/register`
2. **Faça login:** `POST /api/auth/login`
3. **Use o token:** Inclua o header `Authorization: Bearer <token>`

## 📊 API Endpoints e Payloads

### 🔐 Autenticação (`/api/auth`)

#### **POST** `/api/auth/register` - Registrar Usuário
```json
{
  "email": "usuario@exemplo.com",
  "password": "minhasenha123",
  "name": "Nome do Usuário"
}
```

**Resposta:**
```json
{
  "success": true,
  "message": "Usuário registrado com sucesso",
  "data": {
    "user": {
      "id": "cm123...",
      "email": "usuario@exemplo.com",
      "name": "Nome do Usuário"
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

#### **POST** `/api/auth/login` - Login
```json
{
  "email": "usuario@exemplo.com",
  "password": "minhasenha123"
}
```

**Resposta:**
```json
{
  "success": true,
  "message": "Login realizado com sucesso",
  "data": {
    "user": {
      "id": "cm123...",
      "email": "usuario@exemplo.com",
      "name": "Nome do Usuário"
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

#### **GET** `/api/auth/profile` - Buscar Perfil
**Headers:** `Authorization: Bearer <token>`

#### **PUT** `/api/auth/profile` - Atualizar Perfil
**Headers:** `Authorization: Bearer <token>`
```json
{
  "email": "novoemail@exemplo.com",
  "name": "Novo Nome",
  "avatar": "https://exemplo.com/avatar.jpg"
}
```

#### **PUT** `/api/auth/change-password` - Alterar Senha
**Headers:** `Authorization: Bearer <token>`
```json
{
  "currentPassword": "senhaatual123",
  "newPassword": "novasenha456"
}
```

#### **POST** `/api/auth/refresh` - Renovar Token
**Headers:** `Authorization: Bearer <token>`

#### **POST** `/api/auth/logout` - Logout
**Headers:** `Authorization: Bearer <token>`

---

### 👥 Usuários (`/api/users`)

#### **GET** `/api/users` - Listar Usuários
**Query Parameters:**
```
?page=1&limit=10&search=nome&sortBy=name&sortOrder=asc
```

#### **GET** `/api/users/:id` - Buscar Usuário por ID
**Path Parameter:** `id` (string)

#### **PUT** `/api/users/:id` - Atualizar Usuário
**Path Parameter:** `id` (string)
```json
{
  "email": "novoemail@exemplo.com",
  "name": "Novo Nome",
  "avatar": "https://exemplo.com/avatar.jpg"
}
```

#### **DELETE** `/api/users/:id` - Deletar Usuário
**Path Parameter:** `id` (string)

#### **GET** `/api/users/search` - Buscar Usuários
**Query Parameters:**
```
?search=termo&page=1&limit=10&sortBy=name&sortOrder=asc
```

#### **GET** `/api/users/:id/stats` - Estatísticas do Usuário
**Path Parameter:** `id` (string)

#### **GET** `/api/users/my` - Usuário Atual
**Headers:** `Authorization: Bearer <token>`

#### **PUT** `/api/users/my` - Atualizar Usuário Atual
**Headers:** `Authorization: Bearer <token>`
```json
{
  "email": "novoemail@exemplo.com",
  "name": "Novo Nome",
  "avatar": "https://exemplo.com/avatar.jpg"
}
```

#### **DELETE** `/api/users/my` - Deletar Conta Atual
**Headers:** `Authorization: Bearer <token>`

#### **GET** `/api/users/my/stats` - Estatísticas Pessoais
**Headers:** `Authorization: Bearer <token>`

---

### 🏷️ Categorias (`/api/categories`)

#### **GET** `/api/categories` - Listar Categorias
**Headers:** `Authorization: Bearer <token>`
**Query Parameters:**
```
?page=1&limit=10&search=nome&sortBy=name&sortOrder=asc
```

#### **GET** `/api/categories/:id` - Buscar Categoria por ID
**Headers:** `Authorization: Bearer <token>`
**Path Parameter:** `id` (string)

#### **POST** `/api/categories` - Criar Categoria
**Headers:** `Authorization: Bearer <token>`
```json
{
  "name": "Trabalho",
  "description": "Tarefas relacionadas ao trabalho",
  "color": "#3498db"
}
```

#### **PUT** `/api/categories/:id` - Atualizar Categoria
**Headers:** `Authorization: Bearer <token>`
**Path Parameter:** `id` (string)
```json
{
  "name": "Trabalho Urgente",
  "description": "Tarefas urgentes do trabalho",
  "color": "#e74c3c"
}
```

#### **DELETE** `/api/categories/:id` - Deletar Categoria
**Headers:** `Authorization: Bearer <token>`
**Path Parameter:** `id` (string)

#### **GET** `/api/categories/my` - Minhas Categorias
**Headers:** `Authorization: Bearer <token>`
**Query Parameters:**
```
?search=nome&sortBy=name&sortOrder=asc
```

#### **GET** `/api/categories/search` - Buscar Categorias
**Headers:** `Authorization: Bearer <token>`
**Query Parameters:**
```
?search=termo&page=1&limit=10&sortBy=name&sortOrder=asc
```

#### **GET** `/api/categories/:id/stats` - Estatísticas da Categoria
**Headers:** `Authorization: Bearer <token>`
**Path Parameter:** `id` (string)

#### **GET** `/api/categories/with-stats` - Categorias com Estatísticas
**Headers:** `Authorization: Bearer <token>`
**Query Parameters:**
```
?page=1&limit=10&search=nome&sortBy=name&sortOrder=asc
```

---

### ✅ Tarefas (`/api/tasks`)

#### **GET** `/api/tasks` - Listar Tarefas
**Headers:** `Authorization: Bearer <token>`
**Query Parameters:**
```
?page=1&limit=10&search=titulo&status=pending&priority=high&categoryId=cm123&assigneeId=cm456&overdue=true&sortBy=createdAt&sortOrder=desc
```

#### **GET** `/api/tasks/:id` - Buscar Tarefa por ID
**Headers:** `Authorization: Bearer <token>`
**Path Parameter:** `id` (string)

#### **POST** `/api/tasks` - Criar Tarefa
**Headers:** `Authorization: Bearer <token>`
```json
{
  "title": "Implementar nova funcionalidade",
  "description": "Desenvolver o sistema de notificações",
  "priority": "high",
  "dueDate": "2024-12-31T23:59:59.000Z",
  "categoryId": "cm123..."
}
```

#### **PUT** `/api/tasks/:id` - Atualizar Tarefa
**Headers:** `Authorization: Bearer <token>`
**Path Parameter:** `id` (string)
```json
{
  "title": "Implementar nova funcionalidade - Atualizada",
  "description": "Desenvolver o sistema de notificações em tempo real",
  "status": "in_progress",
  "priority": "urgent",
  "dueDate": "2024-12-25T23:59:59.000Z",
  "categoryId": "cm456..."
}
```

#### **DELETE** `/api/tasks/:id` - Deletar Tarefa
**Headers:** `Authorization: Bearer <token>`
**Path Parameter:** `id` (string)

#### **POST** `/api/tasks/:id/assign` - Atribuir Tarefa
**Headers:** `Authorization: Bearer <token>`
**Path Parameter:** `id` (string)
```json
{
  "userId": "cm789..."
}
```

#### **POST** `/api/tasks/:id/unassign` - Desatribuir Tarefa
**Headers:** `Authorization: Bearer <token>`
**Path Parameter:** `id` (string)
```json
{
  "userId": "cm789..."
}
```

#### **POST** `/api/tasks/:id/collaborators` - Adicionar Colaborador
**Headers:** `Authorization: Bearer <token>`
**Path Parameter:** `id` (string)
```json
{
  "userId": "cm789...",
  "role": "reviewer"
}
```

#### **DELETE** `/api/tasks/:id/collaborators` - Remover Colaborador
**Headers:** `Authorization: Bearer <token>`
**Path Parameter:** `id` (string)
```json
{
  "userId": "cm789..."
}
```

#### **GET** `/api/tasks/my` - Minhas Tarefas
**Headers:** `Authorization: Bearer <token>`
**Query Parameters:**
```
?page=1&limit=10&search=titulo&status=pending&priority=high&categoryId=cm123&overdue=true&sortBy=dueDate&sortOrder=asc
```

#### **GET** `/api/tasks/status/:status` - Tarefas por Status
**Headers:** `Authorization: Bearer <token>`
**Path Parameter:** `status` (pending|in_progress|completed|cancelled)

#### **GET** `/api/tasks/overdue` - Tarefas em Atraso
**Headers:** `Authorization: Bearer <token>`

#### **GET** `/api/tasks/search` - Buscar Tarefas
**Headers:** `Authorization: Bearer <token>`
**Query Parameters:**
```
?search=termo&page=1&limit=10&status=pending&priority=high&categoryId=cm123&sortBy=createdAt&sortOrder=desc
```

#### **GET** `/api/tasks/stats` - Estatísticas das Tarefas
**Headers:** `Authorization: Bearer <token>`

#### **PATCH** `/api/tasks/:id/status` - Atualizar Status
**Headers:** `Authorization: Bearer <token>`
**Path Parameter:** `id` (string)
```json
{
  "status": "completed"
}
```

#### **PATCH** `/api/tasks/:id/priority` - Atualizar Prioridade
**Headers:** `Authorization: Bearer <token>`
**Path Parameter:** `id` (string)
```json
{
  "priority": "urgent"
}
```

---

### 📊 Relatórios (`/api/reports`)

#### **GET** `/api/reports/tasks-by-status` - Relatório por Status
**Headers:** `Authorization: Bearer <token>`
**Query Parameters:**
```
?startDate=2024-01-01T00:00:00.000Z&endDate=2024-12-31T23:59:59.000Z
```

#### **GET** `/api/reports/tasks-by-category` - Relatório por Categoria
**Headers:** `Authorization: Bearer <token>`
**Query Parameters:**
```
?startDate=2024-01-01T00:00:00.000Z&endDate=2024-12-31T23:59:59.000Z
```

#### **GET** `/api/reports/user-performance` - Performance do Usuário
**Headers:** `Authorization: Bearer <token>`
**Query Parameters:**
```
?startDate=2024-01-01T00:00:00.000Z&endDate=2024-12-31T23:59:59.000Z
```

#### **GET** `/api/reports/productivity` - Relatório de Produtividade
**Headers:** `Authorization: Bearer <token>`
**Query Parameters:**
```
?startDate=2024-01-01T00:00:00.000Z&endDate=2024-12-31T23:59:59.000Z&groupBy=day
```

#### **GET** `/api/reports/collaboration` - Relatório de Colaboração
**Headers:** `Authorization: Bearer <token>`
**Query Parameters:**
```
?startDate=2024-01-01T00:00:00.000Z&endDate=2024-12-31T23:59:59.000Z
```

#### **GET** `/api/reports/dashboard` - Dados do Dashboard
**Headers:** `Authorization: Bearer <token>`

#### **GET** `/api/reports/overview/tasks` - Visão Geral das Tarefas
**Headers:** `Authorization: Bearer <token>`

#### **GET** `/api/reports/overview/categories` - Visão Geral das Categorias
**Headers:** `Authorization: Bearer <token>`

#### **GET** `/api/reports/overview/performance` - Visão Geral da Performance
**Headers:** `Authorization: Bearer <token>`

#### **GET** `/api/reports/productivity/weekly` - Produtividade Semanal
**Headers:** `Authorization: Bearer <token>`

#### **GET** `/api/reports/productivity/monthly` - Produtividade Mensal
**Headers:** `Authorization: Bearer <token>`

#### **POST** `/api/reports/custom` - Relatório Customizado
**Headers:** `Authorization: Bearer <token>`
```json
{
  "reportType": "status",
  "startDate": "2024-01-01T00:00:00.000Z",
  "endDate": "2024-12-31T23:59:59.000Z",
  "groupBy": "week"
}
```

**Tipos de relatório válidos:**
- `status` - Relatório por status
- `category` - Relatório por categoria
- `performance` - Relatório de performance
- `productivity` - Relatório de produtividade
- `collaboration` - Relatório de colaboração

**Opções de agrupamento (groupBy):**
- `day` - Por dia
- `week` - Por semana
- `month` - Por mês

---

## 📝 Exemplos de Resposta

### Resposta de Sucesso
```json
{
  "success": true,
  "message": "Operação realizada com sucesso",
  "data": {
    // dados da resposta
  },
  "timestamp": "2024-07-19T14:30:00.000Z"
}
```

### Resposta com Paginação
```json
{
  "success": true,
  "message": "Dados recuperados com sucesso",
  "data": [
    // array de dados
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  },
  "timestamp": "2024-07-19T14:30:00.000Z"
}
```

### Resposta de Erro
```json
{
  "success": false,
  "message": "Erro na operação",
  "errors": [
    {
      "field": "email",
      "message": "E-mail é obrigatório"
    }
  ],
  "timestamp": "2024-07-19T14:30:00.000Z"
}
```

---

## 🧪 Testes

O projeto inclui testes automatizados com Jest:

```bash
# Executar todos os testes
npm test

# Executar testes específicos
npm test -- --testNamePattern="User"

# Executar com cobertura
npm run test:coverage
```

### Estrutura de Testes

- **Unit Tests**: Testam funções e classes isoladamente
- **Integration Tests**: Testam a integração entre camadas
- **E2E Tests**: Testam fluxos completos da API

## 📚 Documentação da API

A documentação completa da API está disponível via Swagger:

- **Desenvolvimento**: `http://localhost:3000/api-docs`
- **Produção**: `https://your-api-url/api-docs`

## 🚀 Deploy

### Deploy Serverless (AWS Lambda)

1. **Configure AWS CLI:**
```bash
aws configure
```

2. **Deploy:**
```bash
npm run deploy           # Produção
npm run deploy:dev       # Desenvolvimento
```

### Variáveis de Ambiente para Produção

```bash
NODE_ENV=production
JWT_SECRET=your-super-secure-jwt-secret
DATABASE_URL=postgresql://user:pass@host:5432/db
AWS_REGION=us-east-1
```

## 🔧 Decisões Técnicas

### Arquitetura

- **MVC Pattern**: Separação clara de responsabilidades
- **Repository Pattern**: Abstração da camada de dados
- **Service Layer**: Lógica de negócio centralizada
- **Middleware Chain**: Processamento de requisições modular

### Banco de Dados

- **PostgreSQL**: Escolhido pela robustez e recursos avançados
- **Prisma ORM**: Type-safe, produtivo e moderno
- **Migrations**: Versionamento do schema do banco

### Autenticação

- **JWT**: Stateless, escalável e seguro
- **bcryptjs**: Hash seguro de senhas
- **Middleware de proteção**: Validação automática de tokens

### Validação

- **Zod**: Type-safe schema validation
- **Middleware de validação**: Validação automática de entrada

### Testes

- **Jest**: Framework completo e configurável
- **Supertest**: Testes de integração para APIs
- **Mocks**: Isolamento de dependências

## 🛡️ Segurança

- **Helmet**: Headers de segurança
- **CORS**: Controle de origem cruzada
- **Rate Limiting**: Proteção contra ataques
- **Input Validation**: Validação rigorosa de entrada
- **JWT Expiration**: Tokens com expiração

## 📈 Performance

- **Compression**: Compressão de respostas
- **Connection Pooling**: Pool de conexões do banco
- **Query Optimization**: Queries otimizadas com Prisma
- **Caching**: Cache de dados frequentes

## 🔄 CI/CD

O projeto está preparado para integração contínua:

- **GitHub Actions**: Workflows automatizados
- **ESLint**: Análise de código
- **Jest**: Testes automatizados
- **Docker**: Containerização consistente

## 🐛 Troubleshooting

### Problemas Comuns

1. **Erro de conexão com banco:**
   - Verifique se o PostgreSQL está rodando
   - Confirme a URL de conexão no `.env`

2. **Erro de migração:**
   - Execute `npm run prisma:reset`
   - Verifique permissões do banco

3. **Erro de autenticação:**
   - Verifique o JWT_SECRET no `.env`
   - Confirme formato do token

## 📄 Licença

Este projeto está sob a licença ISC.

## 👥 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📞 Suporte

Para suporte e dúvidas:
- Abra uma issue no GitHub
- Consulte a documentação da API
- Verifique os logs da aplicação
