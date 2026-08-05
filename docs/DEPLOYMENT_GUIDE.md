# Production Deployment Guide - PFIS

## Prerequisites

- Docker Desktop / Docker Engine v20.10+
- Docker Compose v2.0+

## Step 1: Environment Configuration

Copy `.env.example` to `.env` in `backend/` and update secrets:
```bash
SECRET_KEY=your_production_secure_secret_key_here
DATABASE_URL=postgresql://pfis_user:pfis_password@postgres:5432/pfis_db
```

## Step 2: Build & Spin Up Services

From the project root:
```bash
docker-compose up --build -d
```

Verify all 3 containers are active:
```bash
docker-compose ps
```

- `pfis_postgres`: PostgreSQL Database (Port 5432)
- `pfis_backend`: FastAPI App (Port 8000)
- `pfis_frontend`: Nginx + React Frontend (Port 80)

## Step 3: Access Application

- Web Application UI: `http://localhost`
- Backend API Docs: `http://localhost/api/docs` or `http://localhost:8000/docs`

## Step 4: Backup & Logs

Inspect backend logs:
```bash
docker-compose logs -f backend
```

Backup PostgreSQL database:
```bash
docker exec -t pfis_postgres pg_dump -U pfis_user pfis_db > backup.sql
```
