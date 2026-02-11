#!/bin/bash
# ============================================================
# Family Tree App - PostgreSQL Backup Script
# Runs daily via cron, keeps 7 daily + 4 weekly backups
# Usage: bash deploy/backup.sh
# ============================================================

set -e

BACKUP_DIR="/backups"
DAILY_DIR="$BACKUP_DIR/daily"
WEEKLY_DIR="$BACKUP_DIR/weekly"
CONTAINER_NAME="familytree-db"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DAY_OF_WEEK=$(date +%u)  # 1=Monday, 7=Sunday

# Load env vars for DB credentials
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
if [ -f "$PROJECT_DIR/.env.production" ]; then
    export $(grep -v '^#' "$PROJECT_DIR/.env.production" | xargs)
fi

DB_USER="${DB_USER:-familytree}"
DB_NAME="${DB_NAME:-familytree}"
BACKUP_FILE="familytree_${TIMESTAMP}.sql.gz"
LOG_FILE="$BACKUP_DIR/backup.log"

# Ensure directories exist
mkdir -p "$DAILY_DIR" "$WEEKLY_DIR"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# ---- Check if DB container is running ----
if ! docker inspect "$CONTAINER_NAME" > /dev/null 2>&1; then
    log "ERROR: Container $CONTAINER_NAME not found. Is the app running?"
    exit 1
fi

if [ "$(docker inspect -f '{{.State.Running}}' $CONTAINER_NAME)" != "true" ]; then
    log "ERROR: Container $CONTAINER_NAME is not running."
    exit 1
fi

# ---- Create backup ----
log "Starting daily backup..."
docker exec "$CONTAINER_NAME" pg_dump -U "$DB_USER" -d "$DB_NAME" \
    --no-owner --no-acl --clean --if-exists \
    | gzip > "$DAILY_DIR/$BACKUP_FILE"

BACKUP_SIZE=$(du -h "$DAILY_DIR/$BACKUP_FILE" | cut -f1)
log "Daily backup created: $BACKUP_FILE ($BACKUP_SIZE)"

# ---- Weekly backup (every Sunday) ----
if [ "$DAY_OF_WEEK" -eq 7 ]; then
    cp "$DAILY_DIR/$BACKUP_FILE" "$WEEKLY_DIR/$BACKUP_FILE"
    log "Weekly backup created (Sunday): $BACKUP_FILE"
fi

# ---- Rotate daily backups (keep last 7) ----
DAILY_COUNT=$(ls -1 "$DAILY_DIR"/*.sql.gz 2>/dev/null | wc -l)
if [ "$DAILY_COUNT" -gt 7 ]; then
    REMOVE_COUNT=$((DAILY_COUNT - 7))
    ls -1t "$DAILY_DIR"/*.sql.gz | tail -n "$REMOVE_COUNT" | xargs rm -f
    log "Rotated daily backups: removed $REMOVE_COUNT old backup(s), kept 7"
fi

# ---- Rotate weekly backups (keep last 4) ----
WEEKLY_COUNT=$(ls -1 "$WEEKLY_DIR"/*.sql.gz 2>/dev/null | wc -l)
if [ "$WEEKLY_COUNT" -gt 4 ]; then
    REMOVE_COUNT=$((WEEKLY_COUNT - 4))
    ls -1t "$WEEKLY_DIR"/*.sql.gz | tail -n "$REMOVE_COUNT" | xargs rm -f
    log "Rotated weekly backups: removed $REMOVE_COUNT old backup(s), kept 4"
fi

# ---- Summary ----
TOTAL_SIZE=$(du -sh "$BACKUP_DIR" 2>/dev/null | cut -f1)
log "Backup complete. Total backup storage: $TOTAL_SIZE"
log "  Daily backups:  $(ls -1 "$DAILY_DIR"/*.sql.gz 2>/dev/null | wc -l)/7"
log "  Weekly backups: $(ls -1 "$WEEKLY_DIR"/*.sql.gz 2>/dev/null | wc -l)/4"
echo ""

# ---- Restore instructions (printed only when run manually) ----
if [ -t 1 ]; then
    echo ""
    echo "To restore from a backup:"
    echo "  gunzip -c /backups/daily/<backup>.sql.gz | docker exec -i $CONTAINER_NAME psql -U $DB_USER -d $DB_NAME"
    echo ""
fi
