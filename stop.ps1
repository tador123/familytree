# Family Tree Application - Stop Script (PowerShell)
# This script stops all Docker services for the Family Tree application

Write-Host "[STOP] Stopping Family Tree Application..." -ForegroundColor Yellow
Write-Host ""

# Check if Docker is running
try {
    docker info | Out-Null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] Docker is not running." -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "[ERROR] Docker is not installed or not running." -ForegroundColor Red
    exit 1
}

Write-Host "Stopping Docker containers..." -ForegroundColor Cyan
docker-compose down

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "[OK] Family Tree Application stopped successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "To start again: .\start.ps1" -ForegroundColor Cyan
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "[ERROR] Failed to stop services. Check with: docker-compose ps" -ForegroundColor Red
    exit 1
}
