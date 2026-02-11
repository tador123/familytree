#!/bin/bash
# ============================================================
# Oracle Cloud Free Tier - Instance Setup Script (One-Time)
# For: Ubuntu 22.04/24.04 on ARM VM.Standard.A1.Flex
# Specs: 4 OCPUs, 24GB RAM, 200GB boot volume (Always Free)
# 
# Run this ONCE after launching a new OCI compute instance
# Usage: ssh -i your-key.pem ubuntu@<your-ip> 
#        bash oracle-setup.sh
# ============================================================

set -e

echo "============================================================"
echo "  Family Tree App - Oracle Cloud Instance Setup"
echo "  (ARM VM.Standard.A1.Flex - 4 OCPU / 24GB RAM)"
echo "============================================================"
echo ""

# ---- Verify ARM architecture ----
ARCH=$(uname -m)
echo "  Architecture: $ARCH"
if [ "$ARCH" != "aarch64" ]; then
    echo "  ⚠  Warning: Expected ARM (aarch64), got $ARCH"
    echo "     Continuing anyway, but Docker images must match your arch."
fi
echo ""

# ---- Step 1: Update system ----
echo "[1/7] Updating system packages..."
sudo apt-get update -y && sudo apt-get upgrade -y
echo "  ✓ System updated"
echo ""

# ---- Step 2: Install Docker ----
echo "[2/7] Installing Docker..."
if command -v docker &> /dev/null; then
    echo "  ✓ Docker already installed: $(docker --version)"
else
    sudo apt-get install -y ca-certificates curl gnupg lsb-release
    sudo install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    sudo chmod a+r /etc/apt/keyrings/docker.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo $VERSION_CODENAME) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    sudo apt-get update -y
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    sudo systemctl start docker
    sudo systemctl enable docker
    sudo usermod -aG docker ubuntu
    echo "  ✓ Docker installed: $(docker --version)"
fi
echo ""

# ---- Step 3: Verify Docker Compose ----
echo "[3/7] Verifying Docker Compose..."
docker compose version 2>/dev/null || sudo docker compose version
echo "  ✓ Docker Compose available"
echo ""

# ---- Step 4: Install Git & utilities ----
echo "[4/7] Installing Git and utilities..."
sudo apt-get install -y git curl wget htop jq
echo "  ✓ Git and utilities installed"
echo ""

# ---- Step 5: Configure iptables (Oracle Cloud specific) ----
echo "[5/7] Configuring iptables for Oracle Cloud..."
echo ""
echo "  Oracle Cloud's default Ubuntu image has iptables rules that BLOCK"
echo "  incoming traffic on ports 80/443, even if the VCN Security List allows it."
echo "  Adding rules to allow HTTP/HTTPS traffic..."
echo ""

# Allow HTTP (port 80)
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT
# Allow HTTPS (port 443)  
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT

# Persist iptables rules across reboots
sudo apt-get install -y iptables-persistent
sudo netfilter-persistent save
echo "  ✓ iptables rules added and persisted (ports 80, 443)"
echo ""

# ---- Step 6: System tuning for Docker ----
echo "[6/7] Tuning system for Docker workloads..."

# Increase file watchers (for development if needed)
if ! grep -q "fs.inotify.max_user_watches" /etc/sysctl.conf; then
    echo 'fs.inotify.max_user_watches=524288' | sudo tee -a /etc/sysctl.conf
fi

# Increase max map count (good for databases)
if ! grep -q "vm.max_map_count" /etc/sysctl.conf; then
    echo 'vm.max_map_count=262144' | sudo tee -a /etc/sysctl.conf
fi

# Optimize network for web serving
if ! grep -q "net.core.somaxconn" /etc/sysctl.conf; then
    cat << 'SYSCTL' | sudo tee -a /etc/sysctl.conf

# Network optimizations for web serving
net.core.somaxconn=65535
net.ipv4.tcp_max_syn_backlog=65535
net.ipv4.ip_local_port_range=1024 65535
net.ipv4.tcp_tw_reuse=1
SYSCTL
fi

sudo sysctl -p
echo "  ✓ System tuned"
echo ""

# ---- Step 7: Create backup directory ----
echo "[7/7] Setting up backup directory..."
sudo mkdir -p /backups/daily /backups/weekly
sudo chown -R ubuntu:ubuntu /backups
echo "  ✓ Backup directory created at /backups/"
echo ""

# ---- Summary ----
echo "============================================================"
echo "  ✓ Oracle Cloud Setup Complete!"
echo "============================================================"
echo ""
echo "  Instance: ARM VM.Standard.A1.Flex"
echo "  RAM: $(free -h | awk '/^Mem:/ {print $2}')"
echo "  CPUs: $(nproc)"
echo "  Disk: $(df -h / | awk 'NR==2 {print $2}')"
echo "  Arch: $(uname -m)"
echo ""
echo "  ⚠  IMPORTANT: Complete these steps before deploying:"
echo ""
echo "  1. LOG OUT AND LOG BACK IN (for Docker group):"
echo "     exit"
echo "     ssh -i your-key.pem ubuntu@your-ip"
echo ""
echo "  2. CONFIGURE VCN SECURITY LIST in Oracle Cloud Console:"
echo "     → Networking > Virtual Cloud Networks > your-vcn"
echo "     → Subnets > your-subnet > Security Lists > Default"
echo "     → Add Ingress Rules:"
echo "     ┌──────────────┬──────────┬────────────┬───────────┐"
echo "     │ Source CIDR   │ Protocol │ Dest Port  │ Purpose   │"
echo "     ├──────────────┼──────────┼────────────┼───────────┤"
echo "     │ 0.0.0.0/0    │ TCP      │ 80         │ HTTP      │"
echo "     │ 0.0.0.0/0    │ TCP      │ 443        │ HTTPS     │"
echo "     └──────────────┴──────────┴────────────┴───────────┘"
echo "     (Port 22/SSH should already be open by default)"
echo ""
echo "  3. GET YOUR PUBLIC IP:"
echo "     curl -s ifconfig.me"
echo ""
echo "  4. CLONE AND DEPLOY:"
echo "     cd /home/ubuntu"
echo "     git clone <your-repo-url> family-tree"
echo "     cd family-tree"
echo "     bash deploy/deploy.sh"
echo ""
echo "  5. (OPTIONAL) SET UP CUSTOM DOMAIN:"
echo "     Point your domain's A record to your public IP."
echo "     Oracle Free Tier gives you a static public IP."
echo ""
echo "============================================================"
