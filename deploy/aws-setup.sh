#!/bin/bash
# ============================================================
# AWS EC2 Free Tier - Instance Setup Script (One-Time)
# For: Ubuntu 24.04 LTS on t2.micro / t3.micro
# Specs: 1 vCPU, 1 GB RAM, 30 GB EBS (Free Tier - 12 months)
#
# Run this ONCE after launching a new EC2 instance
# Usage: ssh -i your-key.pem ubuntu@<your-elastic-ip>
#        bash aws-setup.sh
# ============================================================

set -e

echo "============================================================"
echo "  Family Tree App - AWS EC2 Free Tier Setup"
echo "  (t2.micro / t3.micro — 1 vCPU / 1 GB RAM)"
echo "============================================================"
echo ""

# ---- Detect OS ----
if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS=$ID
    echo "  OS: $PRETTY_NAME"
else
    echo "  ✗ Cannot detect OS. This script supports Ubuntu and Amazon Linux."
    exit 1
fi
echo "  Arch: $(uname -m)"
echo "  RAM: $(free -h | awk '/^Mem:/ {print $2}')"
echo ""

# ---- Step 1: Update system ----
echo "[1/8] Updating system packages..."
if [ "$OS" = "amzn" ]; then
    sudo yum update -y -q
elif [ "$OS" = "ubuntu" ] || [ "$OS" = "debian" ]; then
    sudo apt-get update -y -qq && sudo apt-get upgrade -y -qq
fi
echo "  ✓ System updated"
echo ""

# ---- Step 2: Install Docker ----
echo "[2/8] Installing Docker..."
if command -v docker &> /dev/null; then
    echo "  ✓ Docker already installed: $(docker --version)"
else
    if [ "$OS" = "amzn" ]; then
        sudo yum install -y docker
        sudo systemctl start docker
        sudo systemctl enable docker
        sudo usermod -aG docker ec2-user
    elif [ "$OS" = "ubuntu" ] || [ "$OS" = "debian" ]; then
        sudo apt-get install -y ca-certificates curl gnupg
        sudo install -m 0755 -d /etc/apt/keyrings
        curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
        sudo chmod a+r /etc/apt/keyrings/docker.gpg
        echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo $VERSION_CODENAME) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
        sudo apt-get update -y -qq
        sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
        sudo systemctl start docker
        sudo systemctl enable docker
        sudo usermod -aG docker ubuntu
    fi
    echo "  ✓ Docker installed: $(docker --version)"
fi
echo ""

# ---- Step 3: Verify Docker Compose ----
echo "[3/8] Verifying Docker Compose..."
if docker compose version &> /dev/null; then
    echo "  ✓ $(docker compose version)"
else
    sudo mkdir -p /usr/local/lib/docker/cli-plugins
    COMPOSE_URL="https://github.com/docker/compose/releases/latest/download/docker-compose-linux-$(uname -m)"
    sudo curl -SL "$COMPOSE_URL" -o /usr/local/lib/docker/cli-plugins/docker-compose
    sudo chmod +x /usr/local/lib/docker/cli-plugins/docker-compose
    echo "  ✓ Docker Compose installed: $(docker compose version)"
fi
echo ""

# ---- Step 4: Create swap space (CRITICAL for 1 GB RAM) ----
echo "[4/8] Setting up swap space (2 GB — essential for t2.micro)..."
if [ -f /swapfile ]; then
    echo "  ✓ Swap already exists: $(swapon --show | awk 'NR==2 {print $3}')"
else
    sudo fallocate -l 2G /swapfile
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab > /dev/null

    # Optimize swap — only use when RAM is nearly full
    sudo sysctl -w vm.swappiness=10
    sudo sysctl -w vm.vfs_cache_pressure=50
    echo 'vm.swappiness=10' | sudo tee -a /etc/sysctl.conf > /dev/null
    echo 'vm.vfs_cache_pressure=50' | sudo tee -a /etc/sysctl.conf > /dev/null
    echo "  ✓ 2 GB swap created (total usable: ~3 GB)"
fi
echo ""

# ---- Step 5: Install Git & utilities ----
echo "[5/8] Installing Git and utilities..."
if [ "$OS" = "amzn" ]; then
    sudo yum install -y git curl wget htop jq -q
elif [ "$OS" = "ubuntu" ] || [ "$OS" = "debian" ]; then
    sudo apt-get install -y git curl wget htop jq -qq
fi
echo "  ✓ Git and utilities installed"
echo ""

# ---- Step 6: System tuning for low-memory Docker ----
echo "[6/8] Tuning system for low-memory Docker workloads..."

SYSCTL_TWEAKS="
# --- Family Tree App optimizations ---
fs.inotify.max_user_watches=65536
vm.max_map_count=262144
net.core.somaxconn=1024
net.ipv4.tcp_max_syn_backlog=1024
net.ipv4.tcp_tw_reuse=1
net.core.rmem_default=131072
net.core.wmem_default=131072
net.ipv4.tcp_rmem=4096 87380 1048576
net.ipv4.tcp_wmem=4096 65536 1048576
"

if ! grep -q "Family Tree App optimizations" /etc/sysctl.conf 2>/dev/null; then
    echo "$SYSCTL_TWEAKS" | sudo tee -a /etc/sysctl.conf > /dev/null
    sudo sysctl -p > /dev/null 2>&1
fi
echo "  ✓ System tuned for low-memory deployment"
echo ""

# ---- Step 7: Firewall ----
echo "[7/8] Configuring firewall..."
if command -v ufw &> /dev/null; then
    sudo ufw allow 22/tcp   > /dev/null 2>&1
    sudo ufw allow 80/tcp   > /dev/null 2>&1
    sudo ufw allow 443/tcp  > /dev/null 2>&1
    sudo ufw --force enable > /dev/null 2>&1
    echo "  ✓ UFW configured (ports 22, 80, 443)"
else
    echo "  ✓ No UFW — using EC2 Security Groups only"
fi
echo ""

# ---- Step 8: Create directories ----
echo "[8/8] Setting up directories..."
WHOAMI=$(whoami)
sudo mkdir -p /backups/daily /backups/weekly
sudo chown -R "$WHOAMI:$WHOAMI" /backups
echo "  ✓ Backup directory created at /backups/"
echo ""

# ---- Summary ----
echo "============================================================"
echo "  ✓ AWS EC2 Free Tier Setup Complete!"
echo "============================================================"
echo ""
echo "  Instance type: t2.micro / t3.micro"
echo "  RAM:  $(free -h | awk '/^Mem:/ {print $2}') + 2G swap = ~3 GB usable"
echo "  CPUs: $(nproc)"
echo "  Disk: $(df -h / | awk 'NR==2 {print $2}')"
echo "  Arch: $(uname -m)"
echo ""
echo "  ⚠  COMPLETE THESE STEPS:"
echo ""
echo "  1. LOG OUT AND LOG BACK IN (for Docker group):"
echo "     exit"
echo "     ssh -i your-key.pem ${WHOAMI}@your-elastic-ip"
echo ""
echo "  2. VERIFY EC2 SECURITY GROUP (in AWS Console):"
echo "     → EC2 > Instances > your-instance > Security tab"
echo "     → Click the Security Group → Edit inbound rules"
echo "     → Ensure these rules exist:"
echo "     ┌──────────────┬──────────┬────────────┬───────────┐"
echo "     │ Source        │ Protocol │ Port       │ Purpose   │"
echo "     ├──────────────┼──────────┼────────────┼───────────┤"
echo "     │ 0.0.0.0/0    │ TCP      │ 22         │ SSH       │"
echo "     │ 0.0.0.0/0    │ TCP      │ 80         │ HTTP      │"
echo "     │ 0.0.0.0/0    │ TCP      │ 443        │ HTTPS     │"
echo "     └──────────────┴──────────┴────────────┴───────────┘"
echo ""
echo "  3. ALLOCATE AN ELASTIC IP (free while attached to running instance):"
echo "     → EC2 > Elastic IPs > Allocate → Associate with your instance"
echo "     → Gives you a static public IP that survives reboots"
echo ""
echo "  4. CLONE AND DEPLOY:"
echo "     cd ~"
echo "     git clone <your-repo-url> family-tree"
echo "     cd family-tree"
echo "     cp .env.production.example .env.production"
echo "     nano .env.production   # Set DB_PASSWORD + your Elastic IP"
echo "     bash deploy/deploy.sh"
echo ""
echo "============================================================"
