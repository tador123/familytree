# Family Tree Application - Stop Script (PowerShell)
# This script stops all services (Docker + local frontend)

Write-Host "===========================================================" -ForegroundColor Cyan
Write-Host "  Stopping Family Tree Application..." -ForegroundColor Yellow
Write-Host "===========================================================" -ForegroundColor Cyan
Write-Host ""

# Stop local frontend process
Write-Host "[1/3] Stopping local frontend..." -ForegroundColor Yellow

# Kill any process on port 3000
$frontendProcess = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
if ($frontendProcess) {
    Write-Host "   Stopping process on port 3000..." -ForegroundColor Gray
    Stop-Process -Id $frontendProcess -Force -ErrorAction SilentlyContinue
    Write-Host "   [OK] Frontend process stopped" -ForegroundColor Green
} else {
    Write-Host "   [OK] No frontend process running" -ForegroundColor Green
}

# Clean up temporary files
if (Test-Path ".frontend-job-id") {
    Remove-Item ".frontend-job-id" -Force -ErrorAction SilentlyContinue
}
Write-Host ""

# Stop Docker services
Write-Host "[2/3] Stopping Docker services..." -ForegroundColor Yellow
try {
    docker info | Out-Null 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   Stopping containers..." -ForegroundColor Gray
        docker compose down 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "   Docker services stopped" -ForegroundColor Green
        } else {
            Write-Host "   [WARNING] Some containers may still be running" -ForegroundColor Yellow
        }
    } else {
        Write-Host "   Docker not running" -ForegroundColor Green
    }
} catch {
    Write-Host "   Docker not available" -ForegroundColor Green
}
Write-Host ""

# Clean up
Write-Host "[3/3] Cleaning up..." -ForegroundColor Yellow
Write-Host "   Cleanup complete" -ForegroundColor Green
Write-Host ""

Write-Host "===========================================================" -ForegroundColor Cyan
Write-Host "  Family Tree Application Stopped" -ForegroundColor Green
Write-Host "===========================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "To start again: .\start.ps1" -ForegroundColor Cyan
Write-Host ""
