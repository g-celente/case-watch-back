-- Extensões úteis para PostgreSQL
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Criar usuário para aplicação (opcional)
-- CREATE USER case_watch_user WITH PASSWORD 'secure_password';
-- GRANT ALL PRIVILEGES ON DATABASE case_watch_db TO case_watch_user;
