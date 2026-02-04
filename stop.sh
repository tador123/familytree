#!/bin/bash
# Family Tree Application - Stop Script (Bash)
# This script stops all Docker services for the Family Tree application

echo "🛑 Stopping Family Tree Application..."
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running."
    exit 1
fi

echo "📦 Stopping Docker containers..."
docker-compose down

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Family Tree Application stopped successfully!"
    echo ""
    echo "💡 To start again: ./start.sh"
    echo ""
else
    echo ""
    echo "❌ Failed to stop services. Check with: docker-compose ps"
    exit 1
fi
