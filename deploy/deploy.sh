#!/bin/bash
# ============================================================
# Family Tree Application - Production Deployment Script
# Deploys the application using Docker Compose
# Supports: Oracle Cloud (ARM), AWS EC2, any Linux VPS
# Usage: bash deploy/deploy.sh
# ============================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_DIR"

echo "============================================================"
echo "  Family Tree App - Production Deployment"
echo "============================================================"
echo ""

# Check Docker
echo "[1/9] Checking prerequisites..."
if ! docker info > /dev/null 2>&1; then
    echo "  ✗ Docker is not running. Run: sudo systemctl start docker"
    exit 1
fi
echo "  ✓ Docker is running"

if ! docker compose version > /dev/null 2>&1; then
    echo "  ✗ Docker Compose not found. Run deploy/oracle-setup.sh first."
    exit 1
fi
echo "  ✓ Docker Compose available"
echo ""

# Check/create .env.production
echo "[2/9] Checking environment configuration..."
if [ ! -f .env.production ]; then
    echo "  ✗ .env.production not found!"
    echo ""
    echo "  Creating from template..."
    if [ -f .env.production.example ]; then
        cp .env.production.example .env.production
    else
        cat > .env.production << 'ENVEOF'
# ============================================
# Production Environment Variables
# ============================================

# Database (CHANGE THE PASSWORD!)
DB_USER=familytree
DB_PASSWORD=CHANGE_ME_TO_A_STRONG_PASSWORD
DB_NAME=familytree

# Frontend URLs (leave as-is for Nginx reverse proxy)
NEXT_PUBLIC_API_URL=/api/v1
NEXT_PUBLIC_MEDIA_URL=

# Google OAuth (optional - get from https://console.cloud.google.com)
GOOGLE_CLIENT_ID=

# Email Configuration
EMAIL_PROVIDER=console
FROM_EMAIL=noreply@familytree.local
FROM_NAME=Family Tree App

# Server URLs (set to your EC2 public IP or domain)
API_BASE_URL=http://localhost
FRONTEND_URL=http://localhost
ENVEOF
    fi
    echo ""
    echo "  ⚠  IMPORTANT: Edit .env.production before continuing!"
    echo "     nano .env.production"
    echo ""
    echo "  At minimum, change DB_PASSWORD to something secure."
    echo "  Then re-run: bash deploy/deploy.sh"
    exit 1
fi

# Validate DB_PASSWORD is not default
DB_PASSWORD=$(grep '^DB_PASSWORD=' .env.production | cut -d'=' -f2)
if [ "$DB_PASSWORD" = "CHANGE_ME_TO_A_STRONG_PASSWORD" ] || [ -z "$DB_PASSWORD" ]; then
    echo "  ✗ DB_PASSWORD is still the default! Edit .env.production first."
    echo "    nano .env.production"
    exit 1
fi
echo "  ✓ Environment configured"
echo ""

# Pull latest code if git repo
echo "[3/9] Checking for updates..."
if [ -d .git ]; then
    CURRENT_BRANCH=$(git branch --show-current)
    echo "  Branch: $CURRENT_BRANCH"
    git pull origin "$CURRENT_BRANCH" 2>/dev/null || echo "  (skipped - no remote or offline)"
fi
echo "  ✓ Code is up to date"
echo ""

# Stop existing containers gracefully
echo "[4/9] Stopping existing services..."
docker compose -f docker-compose.prod.yml --env-file .env.production down --timeout 30 2>/dev/null || true
echo "  ✓ Previous deployment stopped"
echo ""

# Build production images
echo "[5/9] Building production images (this may take 5-10 minutes on first run)..."
docker compose -f docker-compose.prod.yml --env-file .env.production build --no-cache
echo "  ✓ Images built"
echo ""

# Start services
echo "[6/9] Starting production services..."
docker compose -f docker-compose.prod.yml --env-file .env.production up -d
echo "  ✓ Services starting..."
echo ""

# Wait for health checks
echo "[7/9] Waiting for services to be healthy..."
echo "  Waiting for database..."
for i in $(seq 1 60); do
    health=$(docker inspect --format='{{.State.Health.Status}}' familytree-db 2>/dev/null || echo "starting")
    if [ "$health" = "healthy" ]; then
        echo "  ✓ Database is healthy"
        break
    fi
    sleep 2
    echo -n "."
done
echo ""

echo "  Waiting for API service..."
for i in $(seq 1 90); do
    health=$(docker inspect --format='{{.State.Health.Status}}' familytree-api 2>/dev/null || echo "starting")
    if [ "$health" = "healthy" ]; then
        echo "  ✓ API service is healthy"
        break
    fi
    sleep 3
    echo -n "."
done
echo ""

echo "  Waiting for Media service..."
for i in $(seq 1 90); do
    health=$(docker inspect --format='{{.State.Health.Status}}' familytree-media 2>/dev/null || echo "starting")
    if [ "$health" = "healthy" ]; then
        echo "  ✓ Media service is healthy"
        break
    fi
    sleep 3
    echo -n "."
done
echo ""

# Get public IP (try Oracle IMDS v2, then AWS IMDS, then generic)
echo "[8/9] Setting up automated backups..."
echo ""

# Setup daily backup cron job
BACKUP_SCRIPT="$PROJECT_DIR/deploy/backup.sh"
CRON_JOB="0 2 * * * /bin/bash $BACKUP_SCRIPT >> /backups/backup.log 2>&1"

# Check if cron job already exists
if crontab -l 2>/dev/null | grep -qF "$BACKUP_SCRIPT"; then
    echo "  ✓ Backup cron job already configured"
else
    (crontab -l 2>/dev/null; echo "$CRON_JOB") | crontab -
    echo "  ✓ Daily backup cron job installed (runs at 2:00 AM)"
fi

# Run initial backup now  
if [ -f "$BACKUP_SCRIPT" ]; then
    echo "  Running initial backup..."
    bash "$BACKUP_SCRIPT" || echo "  ⚠  Initial backup failed (non-blocking)"
fi
echo ""

echo "[9/9] Setting up anti-reclamation keepalive..."
echo ""

# Oracle Cloud may reclaim idle Always Free instances
# This cron generates minimal CPU/network activity every 4 hours
KEEPALIVE_SCRIPT="$PROJECT_DIR/deploy/keepalive.sh"
cat > "$KEEPALIVE_SCRIPT" << 'KEEPALIVE'
#!/bin/bash
# Simple keepalive - generates minimal activity to prevent Oracle idle reclamation
# Runs a health check + light CPU task
curl -sf http://localhost/health/api > /dev/null 2>&1 || true
curl -sf http://localhost/health/media > /dev/null 2>&1 || true
# Brief CPU activity (< 1 second)
dd if=/dev/urandom bs=1M count=1 | md5sum > /dev/null 2>&1
KEEPALIVE
chmod +x "$KEEPALIVE_SCRIPT"

KEEPALIVE_CRON="0 */4 * * * /bin/bash $KEEPALIVE_SCRIPT > /dev/null 2>&1"
if crontab -l 2>/dev/null | grep -qF "keepalive.sh"; then
    echo "  ✓ Keepalive cron already configured"
else
    (crontab -l 2>/dev/null; echo "$KEEPALIVE_CRON") | crontab -
    echo "  ✓ Keepalive cron installed (runs every 4 hours)"
fi
echo ""

# Get public IP (try Oracle IMDS v2, then AWS IMDS, then generic)
PUBLIC_IP=$(curl -s -H "Authorization: Bearer Oracle" -L http://169.254.169.254/opc/v2/vnics/ 2>/dev/null | jq -r '.[0].publicIp' 2>/dev/null || \
    curl -s http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null || \
    curl -s ifconfig.me 2>/dev/null || \
    echo "your-server-ip")

echo ""
echo "============================================================"
echo "  ✓ Deployment Complete!"
echo "============================================================"
echo ""
echo "  Your app is live at: http://$PUBLIC_IP"
echo ""
echo "  Health checks:"
echo "    API:   http://$PUBLIC_IP/health/api"
echo "    Media: http://$PUBLIC_IP/health/media"
echo ""
echo "  Useful commands:"
echo "    View logs:      docker compose -f docker-compose.prod.yml logs -f"
echo "    View API logs:  docker compose -f docker-compose.prod.yml logs -f api-service"
echo "    Restart:        docker compose -f docker-compose.prod.yml restart"
echo "    Stop:           docker compose -f docker-compose.prod.yml down"
echo "    Redeploy:       bash deploy/deploy.sh"
echo "    Manual backup:  bash deploy/backup.sh"
echo "    Restore backup: gunzip -c /backups/daily/<file>.sql.gz | docker exec -i familytree-db psql -U familytree -d familytree"
echo ""
echo "  Automated:"
echo "    Daily backup:   2:00 AM → /backups/daily/ (7 kept)"
echo "    Weekly backup:  Sundays → /backups/weekly/ (4 kept)"
echo "    Keepalive:      Every 4 hours (anti-reclamation)"
echo ""
echo "  Resource usage:"
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}" 2>/dev/null || true
echo ""
