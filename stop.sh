#!/bin/bash
# Family Tree Application - Stop Script (Linux/Mac)
# This script stops all services (Docker + local frontend)

echo "==========================================================="
echo "  Stopping Family Tree Application..."
echo "==========================================================="
echo ""

# Stop local frontend process
echo "[1/3] Stopping local frontend..."
if [ -f ".frontend-pid" ]; then
    FRONTEND_PID=$(cat .frontend-pid)
    if ps -p $FRONTEND_PID > /dev/null 2>&1; then
        echo "   Stopping frontend process (PID: $FRONTEND_PID)..."
        kill -9 $FRONTEND_PID 2>/dev/null || true
        echo "   ✓ Frontend process stopped"
    else
        echo "   ✓ Frontend process not running"
    fi
    rm -f .frontend-pid
fi

# Kill any process on port 3000
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "   Stopping process on port 3000..."
    kill -9 $(lsof -t -i:3000) 2>/dev/null || true
    echo "   ✓ Process on port 3000 stopped"
fi
echo ""

# Stop Docker services
echo "[2/3] Stopping Docker services..."
if docker info > /dev/null 2>&1; then
    echo "   Stopping containers..."
    docker compose down > /dev/null 2>&1
    echo "   ✓ Docker services stopped"
else
    echo "   ✓ Docker not running"
fi
echo ""

# Clean up
echo "[3/3] Cleaning up..."
rm -f .frontend.log .frontend-pid
echo "   ✓ Cleanup complete"
echo ""

echo "==========================================================="
echo "  ✓ Family Tree Application Stopped"
echo "==========================================================="
echo ""
echo "To start again: ./start.sh"
echo ""
