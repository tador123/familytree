# Family Tree Application - Start Script (PowerShell)
# This script starts all Docker services for the Family Tree application

Write-Host "🌳 Starting Family Tree Application..." -ForegroundColor Green
Write-Host ""

# Check if Docker is running
try {
    docker info | Out-Null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Docker is not running. Please start Docker Desktop first." -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Docker is not installed or not running. Please install Docker Desktop." -ForegroundColor Red
    exit 1
}

Write-Host "📦 Building and starting Docker containers..." -ForegroundColor Cyan
docker-compose up -d --build

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Family Tree Application started successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Services:" -ForegroundColor Yellow
    Write-Host "   Frontend:      http://localhost:3000" -ForegroundColor White
    Write-Host "   API Service:   http://localhost:3001" -ForegroundColor White
    Write-Host "   Media Service: http://localhost:3002" -ForegroundColor White
    Write-Host "   PostgreSQL:    localhost:5432" -ForegroundColor White
    Write-Host ""
    Write-Host "🌐 Try these pages:" -ForegroundColor Yellow
    Write-Host "   Bio Cards:     http://localhost:3000/bio-cards" -ForegroundColor White
    Write-Host "   Family Tree:   http://localhost:3000/tree" -ForegroundColor White
    Write-Host "   Members List:  http://localhost:3000/members" -ForegroundColor White
    Write-Host ""
    Write-Host "📊 View logs:      docker-compose logs -f" -ForegroundColor Cyan
    Write-Host "🛑 Stop services:  .\stop.ps1" -ForegroundColor Cyan
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "❌ Failed to start services. Check the logs with: docker-compose logs" -ForegroundColor Red
    exit 1
}
