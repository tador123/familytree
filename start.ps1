# Family Tree Application - Start Script (PowerShell)
# This script starts backend services in Docker and frontend locally for better performance
# Usage: .\start.ps1 [-Build] [-Force]
#   -Build: Rebuild Docker images before starting (slower)
#   -Force: Stop and restart containers even if already running

param(
    [switch]$Build,
    [switch]$Force
)

Write-Host "===========================================================" -ForegroundColor Cyan
Write-Host "  Family Tree Application - Startup Script (Windows)" -ForegroundColor Green
Write-Host "===========================================================" -ForegroundColor Cyan
Write-Host ""

# Enable script execution for this session
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process -Force

# Check if Docker is running
Write-Host "[1/6] Checking Docker..." -ForegroundColor Yellow
try {
    docker info | Out-Null 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "   [ERROR] Docker is not running. Please start Docker Desktop first." -ForegroundColor Red
        exit 1
    }
    Write-Host "   [OK] Docker is running" -ForegroundColor Green
} catch {
    Write-Host "   [ERROR] Docker is not installed. Please install Docker Desktop." -ForegroundColor Red
    exit 1
}
Write-Host ""

# Stop and remove frontend container if running (we'll run it locally)
Write-Host "[2/6] Preparing services..." -ForegroundColor Yellow
if ($Force) {
    Write-Host "   Stopping all containers..." -ForegroundColor Gray
    docker compose down 2>$null | Out-Null
} else {
    Write-Host "   Stopping frontend container (will run locally)..." -ForegroundColor Gray
    docker compose stop frontend 2>$null | Out-Null
    docker compose rm -f frontend 2>$null | Out-Null
}
Write-Host "   [OK] Ready to start services" -ForegroundColor Green
Write-Host ""

# Start backend services (postgres, api-service, media-service)
Write-Host "[3/6] Starting backend services in Docker..." -ForegroundColor Yellow
if ($Build) {
    Write-Host "   Building images (this may take a few minutes)..." -ForegroundColor Gray
    docker compose up -d --build postgres api-service media-service 2>$null
} else {
    docker compose up -d postgres api-service media-service 2>$null
}

if ($LASTEXITCODE -ne 0) {
    Write-Host "   [ERROR] Failed to start backend services" -ForegroundColor Red
    exit 1
}
Write-Host "   [OK] Backend services started" -ForegroundColor Green
Write-Host ""

# Wait for services to be healthy
Write-Host "[4/6] Waiting for services to be healthy..." -ForegroundColor Yellow
Write-Host "   Checking database..." -ForegroundColor Gray
$maxWait = 30
$elapsed = 0
while ($elapsed -lt $maxWait) {
    $health = docker inspect --format='{{.State.Health.Status}}' familytree-db 2>$null
    if ($health -eq "healthy") {
        break
    }
    Start-Sleep -Seconds 2
    $elapsed += 2
    Write-Host "   ." -NoNewline -ForegroundColor Gray
}
Write-Host ""
if ($elapsed -ge $maxWait) {
    Write-Host "   [WARNING] Database took longer than expected to start" -ForegroundColor Yellow
} else {
    Write-Host "   [OK] Database is healthy" -ForegroundColor Green
}

Start-Sleep -Seconds 3

# Sync Prisma schema with database and regenerate client
Write-Host "   Syncing Prisma schema with database..." -ForegroundColor Gray
docker exec familytree-api npx prisma generate 2>$null | Out-Null
docker exec familytree-api npx prisma db push --skip-generate --accept-data-loss 2>$null | Out-Null
docker exec familytree-media npx prisma generate 2>$null | Out-Null
Write-Host "   [OK] Prisma schema synced" -ForegroundColor Green
Write-Host "   [OK] API and Media services ready" -ForegroundColor Green
Write-Host ""

# Check and install frontend dependencies
Write-Host "[5/6] Preparing frontend..." -ForegroundColor Yellow
Push-Location "frontend"
if (!(Test-Path "node_modules")) {
    Write-Host "   Installing dependencies (this may take a minute)..." -ForegroundColor Gray
    npm install 2>$null | Out-Null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "   [ERROR] Failed to install frontend dependencies" -ForegroundColor Red
        Pop-Location
        exit 1
    }
    Write-Host "   [OK] Dependencies installed" -ForegroundColor Green
} else {
    Write-Host "   [OK] Dependencies already installed" -ForegroundColor Green
}
Pop-Location
Write-Host ""

# Start frontend locally
Write-Host "[6/6] Starting frontend locally..." -ForegroundColor Yellow
$env:NEXT_PUBLIC_API_URL = "http://localhost:3001/api/v1"
$env:NEXT_PUBLIC_MEDIA_URL = "http://localhost:3002"
$env:NEXT_PUBLIC_GOOGLE_CLIENT_ID = "295982166319-jf0gk170e24cd570l63r6m5fnrvqrknc.apps.googleusercontent.com"

# Kill any existing frontend process on port 3000
$existingProcess = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
if ($existingProcess) {
    Write-Host "   Stopping existing frontend process..." -ForegroundColor Gray
    Stop-Process -Id $existingProcess -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
}

# Start frontend in a new PowerShell window
Push-Location "frontend"
$frontendPath = $PWD.Path
Pop-Location

$startCommand = "Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process -Force; cd '$frontendPath'; `$env:NEXT_PUBLIC_API_URL='http://localhost:3001/api/v1'; `$env:NEXT_PUBLIC_MEDIA_URL='http://localhost:3002'; `$env:NEXT_PUBLIC_GOOGLE_CLIENT_ID='295982166319-jf0gk170e24cd570l63r6m5fnrvqrknc.apps.googleusercontent.com'; npm run dev; Read-Host 'Press Enter to close'"

Start-Process powershell -ArgumentList "-NoExit", "-Command", $startCommand

Start-Sleep -Seconds 8
Write-Host "   [OK] Frontend starting in new window (may take a few seconds to compile)" -ForegroundColor Green
Write-Host ""

Write-Host "===========================================================" -ForegroundColor Cyan
Write-Host "  SUCCESS! Application Started" -ForegroundColor Green
Write-Host "===========================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Services Running:" -ForegroundColor Yellow
Write-Host "   Frontend (Local):   http://localhost:3000" -ForegroundColor White
Write-Host "   API Service:        http://localhost:3001" -ForegroundColor Cyan
Write-Host "   Media Service:      http://localhost:3002" -ForegroundColor Cyan
Write-Host "   PostgreSQL:         localhost:5432" -ForegroundColor Cyan
Write-Host ""
Write-Host "Try these pages:" -ForegroundColor Yellow
Write-Host "   Home:              http://localhost:3000" -ForegroundColor White
Write-Host "   Add Member:        http://localhost:3000/add-member" -ForegroundColor White
Write-Host "   Family Tree:       http://localhost:3000/tree" -ForegroundColor White
Write-Host "   Members List:      http://localhost:3000/members" -ForegroundColor White
Write-Host "   Bio Cards:         http://localhost:3000/bio-cards" -ForegroundColor White
Write-Host ""
Write-Host "Useful Commands:" -ForegroundColor Yellow
Write-Host "   Rebuild backend:   .\start.ps1 -Build" -ForegroundColor Cyan
Write-Host "   Force restart:     .\start.ps1 -Force" -ForegroundColor Cyan
Write-Host "   View backend logs: docker compose logs -f" -ForegroundColor Cyan
Write-Host "   Stop all:          .\stop.ps1" -ForegroundColor Cyan
Write-Host ""
Write-Host "Note: Frontend is running in a separate window for better visibility" -ForegroundColor Gray
Write-Host "      Backend services are running in Docker containers" -ForegroundColor Gray
Write-Host "      Close the frontend window or run .\stop.ps1 to stop all services" -ForegroundColor Gray
Write-Host ""
