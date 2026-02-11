#!/bin/bash
# ============================================================
# AWS EC2 Instance Setup Script (One-Time)
# For: Amazon Linux 2023 or Ubuntu 22.04 on t2.micro
# Run this ONCE after launching a new EC2 instance
# Usage: ssh into EC2, then: bash aws-setup.sh
# ============================================================

set -e

echo "============================================================"
echo "  Family Tree App - EC2 Instance Setup"
echo "============================================================"
echo ""

# Detect OS
if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS=$ID
else
    echo "Cannot detect OS. Exiting."
    exit 1
fi

echo "[1/6] Updating system packages..."
if [ "$OS" = "amzn" ]; then
    sudo yum update -y
elif [ "$OS" = "ubuntu" ]; then
    sudo apt-get update -y && sudo apt-get upgrade -y
fi
echo "  ✓ System updated"
echo ""

echo "[2/6] Installing Docker..."
if [ "$OS" = "amzn" ]; then
    sudo yum install -y docker
    sudo systemctl start docker
    sudo systemctl enable docker
    sudo usermod -aG docker ec2-user
elif [ "$OS" = "ubuntu" ]; then
    sudo apt-get install -y ca-certificates curl gnupg
    sudo install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    sudo chmod a+r /etc/apt/keyrings/docker.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo $VERSION_CODENAME) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    sudo apt-get update -y
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
    sudo systemctl start docker
    sudo systemctl enable docker
    sudo usermod -aG docker ubuntu
fi
echo "  ✓ Docker installed"
echo ""

echo "[3/6] Installing Docker Compose..."
if [ "$OS" = "amzn" ]; then
    # Install Docker Compose plugin
    sudo mkdir -p /usr/local/lib/docker/cli-plugins
    sudo curl -SL "https://github.com/docker/compose/releases/latest/download/docker-compose-linux-$(uname -m)" -o /usr/local/lib/docker/cli-plugins/docker-compose
    sudo chmod +x /usr/local/lib/docker/cli-plugins/docker-compose
fi
docker compose version 2>/dev/null || sudo docker compose version
echo "  ✓ Docker Compose installed"
echo ""

echo "[4/6] Setting up swap space (2GB - critical for t2.micro)..."
if [ ! -f /swapfile ]; then
    sudo fallocate -l 2G /swapfile
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
    # Optimize swap usage
    echo 'vm.swappiness=10' | sudo tee -a /etc/sysctl.conf
    echo 'vm.vfs_cache_pressure=50' | sudo tee -a /etc/sysctl.conf
    sudo sysctl -p
    echo "  ✓ 2GB swap created"
else
    echo "  ✓ Swap already exists"
fi
echo ""

echo "[5/6] Installing Git..."
if [ "$OS" = "amzn" ]; then
    sudo yum install -y git
elif [ "$OS" = "ubuntu" ]; then
    sudo apt-get install -y git
fi
echo "  ✓ Git installed"
echo ""

echo "[6/6] Configuring firewall & system limits..."
# Increase file watchers limit
echo 'fs.inotify.max_user_watches=65536' | sudo tee -a /etc/sysctl.conf
sudo sysctl -p

# Open ports (EC2 uses Security Groups, but also configure iptables if needed)
if command -v ufw &> /dev/null; then
    sudo ufw allow 80/tcp
    sudo ufw allow 443/tcp
    sudo ufw allow 22/tcp
fi
echo "  ✓ System configured"
echo ""

echo "============================================================"
echo "  ✓ EC2 Setup Complete!"
echo "============================================================"
echo ""
echo "IMPORTANT: Log out and log back in for Docker group to take effect:"
echo "  exit"
echo "  ssh -i your-key.pem ec2-user@your-ip  (Amazon Linux)"
echo "  ssh -i your-key.pem ubuntu@your-ip    (Ubuntu)"
echo ""
echo "Then run the deployment:"
echo "  cd /home/\$(whoami)"
echo "  git clone <your-repo-url> family-tree"
echo "  cd family-tree"
echo "  bash deploy/deploy.sh"
echo ""
