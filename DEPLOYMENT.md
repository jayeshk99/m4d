# Docker Deployment Guide

## What Docker Automates

✅ **Automated by Docker:**

- Node.js installation and version management
- All npm dependencies installation
- Application build process
- Process management (auto-restart on crash)
- Port configuration
- Environment isolation

❌ **Manual Setup (Optional, Outside Docker):**

- Installing Docker on server
- Creating `.env.production` file
- Nginx reverse proxy (if needed)
- SSL certificates (if needed)
- Domain DNS configuration

---

## Quick Start (Minimal Commands)

### 1️⃣ First Time Setup on Server

```bash
# Install Docker & Docker Compose (one-time)
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo apt install docker-compose-plugin

# Add your user to docker group (optional, avoids sudo)
sudo usermod -aG docker $USER
# Log out and back in for this to take effect
```

### 2️⃣ Deploy Your App (Every Time You Update)

```bash
# Pull your code
git clone https://github.com/yourusername/m4d.git
cd m4d

# Create environment file (first time only)
cp .env.production.example .env.production
nano .env.production  # Edit with your actual values

# 🎉 ONE COMMAND TO START EVERYTHING
docker compose up -d --build
```

**That's it!** Your app is now running on port 3000.

Access at: `http://server-ip:3000`

**To expose on port 80/443:** Configure nginx manually on your server (see optional nginx setup below).

---

## Essential Commands

```bash
# View logs
docker compose logs -f

# Stop everything
docker compose down

# Restart after code changes
git pull
docker compose up -d --build

# Check status
docker compose ps

# Execute commands inside container
docker compose exec web sh
```

---

## Update Workflow (After Initial Setup)

Every time you update your code:

```bash
git pull
docker compose up -d --build
```

Just **2 commands** to update everything!

---

## SSL/HTTPS Setup (3 Options)

### **Option 1: Automatic SSL with Traefik (Recommended)** ⭐

The main `docker-compose.yml` includes Traefik which **automatically** gets and renews SSL certificates!

**Setup:**

1. Optional: Nginx + SSL Setup (Manual)

Docker runs your app on port 3000. To expose it on standard HTTP/HTTPS ports and add SSL, configure nginx manually on your server:

### **1. Install Nginx**

```bash
sudo apt install nginx
```

### **2. Configure Nginx**

Create `/etc/nginx/sites-available/m4d`:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable:

```bash
sudo ln -s /etc/nginx/sites-available/m4d /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### **3. Add SSL (Let's Encrypt)**

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

Certbot automatically:

- Gets SSL certificate
- Configures nginx for HTTPS
- Sets up auto-renewal

---

## Alternative: Cloudflare SSL (Easiest)

Don't want to manage nginx/SSL at all?

1. Keep Docker running on port 3000
2. Use Cloudflare as your DNS
3. Enable Cloudflare SSL in dashboard (free)
4. Set SSL mode to "Full"

Cloudflare handles all HTTPS, your server stays simple!
Add to `docker-compose.yml` under the `web` service:

```yaml
deploy:
  resources:
    limits:
      cpus: "1.0"
      memory: 1G
    reservations:
      cpus: "0.5"
      memory: 512M
```

---

## Troubleshooting

### View Real-time Logs

```bash
docker compose logs -f web
```

### Restart Specific Service

```bash
docker compose restart web
```

### Clean Everything and Start Fresh

```bash
docker compose down -v
docker system prune -a
docker compose up -d --build
```

### Check Container Status

```bash
docker compose ps
docker stats
```

## Backup Strategy

```bash
# Backup environment variables
cp .env.production .env.production.backup

# Backup with date
tar -czf backup-$(date +%Y%m%d).tar.gz .env.production docker-compose.yml nginx.conf
```

---
