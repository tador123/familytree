# Family Tree Application

A modern Family Tree application with microservices architecture, featuring biographical data management, media storage, and interactive family tree visualization.

## 🏗️ Architecture

This project consists of:
- **Frontend** (Next.js - Port 3000): Interactive web interface with family tree visualization
- **API Service** (Node.js/Express - Port 3001): Family member logic, relationships, and biographical data
- **Media Service** (Node.js/Express - Port 3002): Photo and document management
- **PostgreSQL Database** (Port 5432): Persistent data storage with relational data model

## 📋 Prerequisites

- **Docker Desktop** - For running backend services
- **Node.js 18+** - For running the frontend locally (better performance on Windows)
- **npm** - Comes with Node.js

## 🚀 Quick Start

### Windows (PowerShell)

**Start the application:**
```powershell
.\start.ps1
```

**Optional flags:**
```powershell
.\start.ps1 -Build    # Rebuild Docker images before starting
.\start.ps1 -Force    # Force restart all services
```

**Stop the application:**
```powershell
.\stop.ps1
```

### Linux/Mac (Bash)

**Start the application:**
```bash
chmod +x start.sh stop.sh  # Make scripts executable (first time only)
./start.sh
```

**Optional flags:**
```bash
./start.sh --build    # Rebuild Docker images before starting
./start.sh --force    # Force restart all services
```

**Stop the application:**
```bash
./stop.sh
```

## 🌐 Service URLs

Once started, access the application at:

- **Frontend**: http://localhost:3000
  - Home: http://localhost:3000
  - Add Member: http://localhost:3000/add-member
  - Family Tree: http://localhost:3000/tree
  - Members List: http://localhost:3000/members
  - Bio Cards: http://localhost:3000/bio-cards

- **API Service**: http://localhost:3001
- **Media Service**: http://localhost:3002
- **PostgreSQL**: localhost:5432

## 🛠️ What the Start Script Does

The startup script automatically:
1. ✓ Checks if Docker is running
2. ✓ Stops the frontend Docker container (we run it locally for better performance)
3. ✓ Starts backend services in Docker (PostgreSQL, API, Media)
4. ✓ Waits for database to be healthy
5. ✓ Checks/installs frontend dependencies
6. ✓ Starts the frontend locally with proper environment variables

**Why run frontend locally?**
- Much faster compilation and hot-reload on Windows
- Avoids Docker volume mount performance issues
- Better developer experience

## 📊 Monitoring & Logs

**View backend service logs:**
```bash
docker compose logs -f              # All services
docker compose logs -f api-service  # Specific service
```

**View frontend logs (Windows):**
```powershell
# Get the job ID from start script output, then:
Receive-Job -Id <job-id> -Keep
```

**View frontend logs (Linux/Mac):**
```bash
tail -f .frontend.log
```

**Check running containers:**
```bash
docker compose ps
```

## 🔧 Development

### Manual Development Setup

If you want to run services individually:

**Backend services only:**
```bash
docker compose up -d postgres api-service media-service
```

**Frontend only (local):**
```bash
cd frontend
npm install
npm run dev
```

### Database Migrations

**Run Prisma migrations:**
```bash
# API Service
docker compose exec api-service npx prisma migrate dev

# Media Service
docker compose exec media-service npx prisma migrate dev
```

**Seed database:**
```bash
docker compose exec api-service npx prisma db seed
docker compose exec media-service npx prisma db seed
```

## 📁 Project Structure

```
.
├── start.ps1              # Windows startup script
├── start.sh               # Linux/Mac startup script
├── stop.ps1               # Windows stop script
├── stop.sh                # Linux/Mac stop script
├── docker-compose.yml     # Docker services configuration
├── services/
│   ├── api-service/       # Family data & relationships API
│   │   ├── Dockerfile
│   │   ├── src/
│   │   │   ├── routes/    # API endpoints
│   │   │   ├── services/  # Business logic
│   │   │   └── types/     # TypeScript types
│   │   └── prisma/
│   │       └── schema.prisma
│   └── media-service/     # Media storage & retrieval API
│       ├── Dockerfile
│       ├── src/
│       │   ├── routes/
│       │   └── utils/
│       └── prisma/
│           └── schema.prisma
├── frontend/              # Next.js application
│   ├── src/
│   │   ├── app/          # Next.js 14 App Router pages
│   │   └── components/   # React components
│   └── package.json
└── database/
    └── init/             # SQL initialization scripts
```

## 🌟 Features

- **Interactive Family Tree**: Visual tree representation with drag-and-drop
- **Bio Cards**: Rich biographical cards with photos and details
- **Member Management**: Add, edit, and delete family members
- **Relationship Tracking**: Parents, children, spouses, siblings
- **Media Gallery**: Photo and document storage per member
- **Scrapbook View**: Curated photo collections
- **Responsive Design**: Works on desktop and mobile

## 🔒 Environment Variables

Environment variables are configured in:
- `docker-compose.yml` for Docker services
- Set programmatically in startup scripts for local frontend

**Key variables:**
- `NEXT_PUBLIC_API_URL`: Frontend → API connection
- `NEXT_PUBLIC_MEDIA_URL`: Frontend → Media service connection
- `DATABASE_URL`: Backend → PostgreSQL connection

## 🐛 Troubleshooting

**Frontend won't start:**
- Make sure port 3000 is not in use
- Check `.\stop.ps1` or `./stop.sh` kills all processes
- Delete `frontend/node_modules` and restart

**Backend services failing:**
- Ensure Docker Desktop is running
- Check logs: `docker compose logs`
- Rebuild: `.\start.ps1 -Build` or `./start.sh --build`

**Database connection errors:**
- Wait for database to be healthy (script waits automatically)
- Check database is running: `docker compose ps`

## 📝 License

MIT
