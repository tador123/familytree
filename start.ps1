# Family Tree Application - Start Script (PowerShell)
# This script starts all Docker services for the Family Tree application
# Usage: .\start.ps1 [-Build] [-Force]
#   -Build: Rebuild Docker images before starting (slower)
#   -Force: Stop and restart containers even if already running

param(
    [switch]$Build,
    [switch]$Force
)

Write-Host "[START] Starting Family Tree Application..." -ForegroundColor Green
Write-Host ""

# Check if Docker is running
try {
    docker info | Out-Null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] Docker is not running. Please start Docker Desktop first." -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "[ERROR] Docker is not installed or not running. Please install Docker Desktop." -ForegroundColor Red
    exit 1
}

# Check if containers are already running
$runningContainers = docker-compose ps -q 2>$null
if ($runningContainers -and !$Force) {
    Write-Host "[INFO] Services are already running!" -ForegroundColor Yellow
    Write-Host "Use -Force flag to restart: .\start.ps1 -Force" -ForegroundColor Gray
    Write-Host ""
} else {
    if ($Force) {
        Write-Host "Stopping existing containers..." -ForegroundColor Yellow
        docker-compose down 2>$null | Out-Null
    }

    if ($Build) {
        Write-Host "Building and starting Docker containers (this may take a few minutes)..." -ForegroundColor Cyan
        docker-compose up -d --build
    } else {
        Write-Host "Starting Docker containers..." -ForegroundColor Cyan
        docker-compose up -d
    }
}

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "[OK] Family Tree Application started successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Services:" -ForegroundColor Yellow
    Write-Host "   Frontend:      http://localhost:3000" -ForegroundColor White
    Write-Host "   API Service:   http://localhost:3001" -ForegroundColor White
    Write-Host "   Media Service: http://localhost:3002" -ForegroundColor White
    Write-Host "   PostgreSQL:    localhost:5432" -ForegroundColor White
    Write-Host ""
    Write-Host "Try these pages:" -ForegroundColor Yellow
    Write-Host "   Bio Cards:     http://localhost:3000/bio-cards" -ForegroundColor White
    Write-Host "   Family Tree:   http://localhost:3000/tree" -ForegroundColor White
    Write-Host "   Members List:  http://localhost:3000/members" -ForegroundColor White
    Write-Host ""
    Write-Host "Commands:" -ForegroundColor Yellow
    Write-Host "   Rebuild:        .\start.ps1 -Build" -ForegroundColor Cyan
    Write-Host "   Force restart:  .\start.ps1 -Force" -ForegroundColor Cyan
    Write-Host "   View logs:      docker-compose logs -f" -ForegroundColor Cyan
    Write-Host "   Stop services:  .\stop.ps1" -ForegroundColor Cyan
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "[ERROR] Failed to start services. Check the logs with: docker-compose logs" -ForegroundColor Red
    exit 1
}
