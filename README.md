# Family Tree Application

A Dockerized monorepo for a Family Tree application with microservices architecture.

## Architecture

This project consists of:
- **API Service** (Port 3001): Handles family member logic, relationships, and biographical data
- **Media Service** (Port 3002): Manages photos, documents, and media files
- **Frontend** (Port 3000): Next.js web application for user interface
- **PostgreSQL Database** (Port 5432): Persistent data storage

## Prerequisites

- Docker Desktop
- Docker Compose
- Node.js 18+ (for local development)

## Quick Start

### Start all services:
```bash
docker-compose up -d
```

### View logs:
```bash
docker-compose logs -f
```

### Stop all services:
```bash
docker-compose down
```

### Rebuild services:
```bash
docker-compose up --build
```

## Service URLs

- Frontend: http://localhost:3000
- API Service: http://localhost:3001
- Media Service: http://localhost:3002
- PostgreSQL: localhost:5432

## Development

Each service has hot-reload enabled for local development.

### Install dependencies for a service:
```bash
cd services/api-service
npm install
```

### Run database migrations:
```bash
docker-compose exec api-service npm run migrate
```

## Project Structure

```
.
├── docker-compose.yml
├── services/
│   ├── api-service/
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src/
│   └── media-service/
│       ├── Dockerfile
│       ├── package.json
│       ├── tsconfig.json
│       └── src/
├── frontend/
│   ├── Dockerfile
│   ├── package.json
│   └── src/
└── database/
    └── init/
```

## Environment Variables

Environment variables are configured in docker-compose.yml. For production, use .env files.

## License

MIT
