# AWS Free Tier — Deployment Guide

Deploy the Family Tree app on a **free** AWS EC2 `t2.micro` instance (1 vCPU, 1 GB RAM, 30 GB disk).

> **Free for 12 months** after AWS account creation. After that, a t2.micro costs ~$8.50/month.

---

## What You Get (Free Tier)

| Resource         | Free Allowance                    |
|------------------|-----------------------------------|
| EC2 Instance     | 750 hrs/month t2.micro (1y free)  |
| EBS Storage      | 30 GB SSD                         |
| Elastic IP       | 1 free (while attached & running) |
| Data Transfer    | 100 GB/month outbound             |

---

## Step 1: Create an AWS Account

1. Go to [aws.amazon.com](https://aws.amazon.com/) → **Create an AWS Account**
2. Enter email, password, credit card (won't be charged for free tier usage)
3. Select **Basic Support — Free**

---

## Step 2: Launch EC2 Instance

1. Go to **EC2 Console** → **Launch Instance**
2. Configure:

   | Setting           | Value                                |
   |-------------------|--------------------------------------|
   | **Name**          | `family-tree-app`                    |
   | **AMI**           | Ubuntu Server 24.04 LTS (Free tier)  |
   | **Instance type** | `t2.micro` (Free tier eligible)      |
   | **Key pair**      | Create new → Download `.pem` file    |
   | **Storage**       | 30 GB gp3 (max free)                |

3. **Network / Security Group** — Create a new security group with:

   | Type  | Port | Source    | Purpose |
   |-------|------|-----------|---------|
   | SSH   | 22   | My IP     | Admin   |
   | HTTP  | 80   | 0.0.0.0/0 | Web    |
   | HTTPS | 443  | 0.0.0.0/0 | Web    |

4. Click **Launch Instance**

---

## Step 3: Allocate Elastic IP (Static Public IP)

Without an Elastic IP, your public IP changes every time you stop/start the instance.

1. Go to **EC2 → Elastic IPs → Allocate Elastic IP address**
2. Click **Associate** → select your instance
3. Your static IP is now assigned (free while instance is running)

> ⚠️ An Elastic IP costs $0.005/hr (~$3.60/mo) if NOT attached to a running instance. Release it if you terminate the instance.

---

## Step 4: SSH In & Run Setup

```bash
# Make your key file read-only
chmod 400 your-key.pem

# Connect to instance
ssh -i your-key.pem ubuntu@YOUR_ELASTIC_IP

# Download the setup script (or clone your repo first)
git clone <your-repo-url> family-tree
cd family-tree

# Run the one-time setup (installs Docker, swap, etc.)
bash deploy/aws-setup.sh
```

After setup completes, **log out and log back in** for Docker group to take effect:
```bash
exit
ssh -i your-key.pem ubuntu@YOUR_ELASTIC_IP
```

---

## Step 5: Configure & Deploy

```bash
cd ~/family-tree

# Create production environment file
cp .env.production.example .env.production
nano .env.production
```

**Required changes in `.env.production`:**

```dotenv
# CHANGE THIS to a strong password
DB_PASSWORD=MyStr0ng_Passw0rd!

# Set to your Elastic IP
API_BASE_URL=http://YOUR_ELASTIC_IP
FRONTEND_URL=http://YOUR_ELASTIC_IP

# Optional: Enable Google OAuth
# GOOGLE_CLIENT_ID=your-google-client-id
```

**Deploy:**
```bash
bash deploy/deploy.sh
```

First build takes **5–10 minutes** on t2.micro. The script will:
- Build all Docker images (optimized for 1 GB RAM)
- Start PostgreSQL, API, Media, Frontend, and Nginx
- Set up daily database backups
- Show you the URL when ready

---

## Step 6: Verify

Open in browser: `http://YOUR_ELASTIC_IP`

Check health:
```bash
curl http://YOUR_ELASTIC_IP/health/api
curl http://YOUR_ELASTIC_IP/health/media
```

---

## Useful Commands

```bash
# View all logs
docker compose -f docker-compose.aws.yml logs -f

# View specific service
docker compose -f docker-compose.aws.yml logs -f api-service

# Restart everything
docker compose -f docker-compose.aws.yml restart

# Stop the app
docker compose -f docker-compose.aws.yml down

# Redeploy after code changes
bash deploy/deploy.sh

# Check memory usage
free -h
docker stats --no-stream

# Manual database backup
bash deploy/backup.sh

# Restore from backup
gunzip -c /backups/daily/FILENAME.sql.gz | \
  docker exec -i familytree-db psql -U familytree -d familytree
```

---

## Memory Usage (t2.micro)

The `docker-compose.aws.yml` is tuned for 1 GB RAM + 2 GB swap:

| Service      | RAM Limit | Node.js Heap |
|--------------|-----------|--------------|
| PostgreSQL   | 256 MB    | —            |
| API Service  | 256 MB    | 200 MB       |
| Media Service| 192 MB    | 150 MB       |
| Frontend     | 192 MB    | 150 MB       |
| Nginx        |  64 MB    | —            |
| **Total**    | **960 MB**| —            |

With the 2 GB swap file created by `aws-setup.sh`, the system has ~3 GB usable memory. Under normal load, most activity fits in the 1 GB physical RAM. Swap activates during builds or traffic spikes.

---

## Cost Monitoring

Set up a **billing alarm** to avoid surprise charges:

1. Go to **AWS Billing → Budgets → Create Budget**
2. Choose **Zero spend budget** → get alerted if anything costs money
3. Or set a **$1/month** threshold

---

## Optional: Custom Domain + HTTPS

1. Register a domain (Cloudflare, Namecheap, etc.)
2. Point domain A record to your Elastic IP
3. SSH in and install Certbot:
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d yourdomain.com
   ```
4. Update `.env.production`:
   ```dotenv
   API_BASE_URL=https://yourdomain.com
   FRONTEND_URL=https://yourdomain.com
   ```
5. Redeploy: `bash deploy/deploy.sh`

---

## Troubleshooting

**Build fails / OOM Killed:**
```bash
# Check if swap is active
swapon --show
# If no swap, re-run setup
bash deploy/aws-setup.sh
```

**Container keeps restarting:**
```bash
# Check which container is failing
docker ps -a
docker logs familytree-api --tail 50
```

**Disk full:**
```bash
# Check disk usage
df -h
# Clean Docker cache
docker system prune -a --volumes
```

**Can't connect from browser:**
- Verify Security Group has port 80 open
- Check `curl http://localhost` from inside the instance
- Ensure Elastic IP is attached
