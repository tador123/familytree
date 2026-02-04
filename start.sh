#!/bin/bash
# Family Tree Application - Start Script (Bash)
# This script starts all Docker services for the Family Tree application

echo "🌳 Starting Family Tree Application..."
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

echo "📦 Building and starting Docker containers..."
docker-compose up -d --build

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Family Tree Application started successfully!"
    echo ""
    echo "📋 Services:"
    echo "   Frontend:      http://localhost:3000"
    echo "   API Service:   http://localhost:3001"
    echo "   Media Service: http://localhost:3002"
    echo "   PostgreSQL:    localhost:5432"
    echo ""
    echo "🌐 Try these pages:"
    echo "   Bio Cards:     http://localhost:3000/bio-cards"
    echo "   Family Tree:   http://localhost:3000/tree"
    echo "   Members List:  http://localhost:3000/members"
    echo ""
    echo "📊 View logs:      docker-compose logs -f"
    echo "🛑 Stop services:  ./stop.sh"
    echo ""
else
    echo ""
    echo "❌ Failed to start services. Check the logs with: docker-compose logs"
    exit 1
fi
