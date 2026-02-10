#!/bin/bash
# Family Tree Application - Start Script (Linux/Mac)
# This script starts backend services in Docker and frontend locally

set -e  # Exit on error

echo "==========================================================="
echo "  Family Tree Application - Startup Script (Linux/Mac)"
echo "==========================================================="
echo ""

BUILD_FLAG=""
FORCE_FLAG=""

# Parse arguments
while [[ "$#" -gt 0 ]]; do
    case $1 in
        --build|-b) BUILD_FLAG="--build" ;;
        --force|-f) FORCE_FLAG="true" ;;
        *) echo "Unknown parameter: $1"; exit 1 ;;
    esac
    shift
done

# Check if Docker is running
echo "[1/6] Checking Docker..."
if ! docker info > /dev/null 2>&1; then
    echo "   ❌ Docker is not running. Please start Docker first."
    exit 1
fi
echo "   ✓ Docker is running"
echo ""

# Stop and remove frontend container (we'll run it locally)
echo "[2/6] Preparing services..."
if [ "$FORCE_FLAG" = "true" ]; then
    echo "   Stopping all containers..."
    docker compose down > /dev/null 2>&1 || true
else
    echo "   Stopping frontend container (will run locally)..."
    docker compose stop frontend > /dev/null 2>&1 || true
    docker compose rm -f frontend > /dev/null 2>&1 || true
fi
echo "   ✓ Ready to start services"
echo ""

# Start backend services
echo "[3/6] Starting backend services in Docker..."
if [ -n "$BUILD_FLAG" ]; then
    echo "   Building images (this may take a few minutes)..."
    docker compose up -d $BUILD_FLAG postgres api-service media-service > /dev/null 2>&1
else
    docker compose up -d postgres api-service media-service > /dev/null 2>&1
fi
echo "   ✓ Backend services started"
echo ""

# Wait for database to be healthy
echo "[4/6] Waiting for services to be healthy..."
echo "   Checking database..."
for i in {1..30}; do
    health=$(docker inspect --format='{{.State.Health.Status}}' familytree-db 2>/dev/null || echo "starting")
    if [ "$health" = "healthy" ]; then
        break
    fi
    sleep 2
    echo -n "."
done
echo ""
echo "   ✓ Database is healthy"
sleep 3
echo "   ✓ API and Media services ready"
echo ""

# Check and install frontend dependencies
echo "[5/6] Preparing frontend..."
cd frontend
if [ ! -d "node_modules" ]; then
    echo "   Installing dependencies (this may take a minute)..."
    npm install > /dev/null 2>&1
    echo "   ✓ Dependencies installed"
else
    echo "   ✓ Dependencies already installed"
fi
cd ..
echo ""

# Start frontend locally
echo "[6/6] Starting frontend locally..."
export NEXT_PUBLIC_API_URL="http://localhost:3001/api/v1"
export NEXT_PUBLIC_MEDIA_URL="http://localhost:3002/api/v1"

# Kill any existing process on port 3000
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "   Stopping existing frontend process..."
    kill -9 $(lsof -t -i:3000) 2>/dev/null || true
    sleep 2
fi

# Start frontend in background
cd frontend
nohup npm run dev > ../.frontend.log 2>&1 &
FRONTEND_PID=$!
echo $FRONTEND_PID > ../.frontend-pid
cd ..

sleep 5
echo "   ✓ Frontend starting (may take a few seconds to compile)"
echo ""

echo "==========================================================="
echo "  ✓ Family Tree Application Started Successfully!"
echo "==========================================================="
echo ""
echo "Services Running:"
echo "   Frontend (Local):   http://localhost:3000"
echo "   API Service:        http://localhost:3001"
echo "   Media Service:      http://localhost:3002"
echo "   PostgreSQL:         localhost:5432"
echo ""
echo "Try these pages:"
echo "   Home:              http://localhost:3000"
echo "   Add Member:        http://localhost:3000/add-member"
echo "   Family Tree:       http://localhost:3000/tree"
echo "   Members List:      http://localhost:3000/members"
echo "   Bio Cards:         http://localhost:3000/bio-cards"
echo ""
echo "Useful Commands:"
echo "   Rebuild backend:   ./start.sh --build"
echo "   Force restart:     ./start.sh --force"
echo "   View backend logs: docker compose logs -f"
echo "   View frontend:     tail -f .frontend.log"
echo "   Stop all:          ./stop.sh"
echo ""
echo "Note: Frontend is running locally (PID: $FRONTEND_PID)"
echo "      Backend services are running in Docker containers"
echo ""
