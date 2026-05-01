# Server Setup Guide for M4D Application

This guide provides step-by-step instructions for deploying the M4D Next.js application on a Linux server.

---

## Prerequisites

- Fresh Ubuntu 20.04/22.04 or Debian server
- Root or sudo access
- Domain name pointed to server IP (optional, for SSL)
- Server ports 80, 443, and 22 open

---

## Step 1: Initial Server Setup

### 1.1 Update System Packages

```bash
sudo apt update
sudo apt upgrade -y
```

### 1.2 Install Basic Tools

```bash
sudo apt install -y curl git ufw
```

### 1.3 Configure Firewall

```bash
# Allow SSH, HTTP, and HTTPS
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable
sudo ufw status
```

---

## Step 2: Install Docker

### 2.1 Install Docker

```bash
# Remove old Docker installations (if any)
sudo apt remove docker docker-engine docker.io containerd runc

# Install Docker using official script
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Verify installation
docker --version
```

### 2.2 Install Docker Compose

```bash
# Docker Compose is included with Docker by default now
# Verify installation
docker compose version
```

### 2.3 Add User to Docker Group (Optional)

This allows running Docker commands without sudo:

```bash
sudo usermod -aG docker $USER

# Log out and log back in for this to take effect
# Or run: newgrp docker
```

### 2.4 Enable Docker Auto-Start

```bash
sudo systemctl enable docker
sudo systemctl start docker
```

---

## Step 3: Clone the Application

### 3.1 Navigate to Deployment Directory

```bash
cd /opt
# or use /var/www or /home/username - your choice
```

### 3.2 Clone from GitHub

```bash
git clone https://github.com/jayeshk99/m4d.git
cd m4d
```

---

## Step 4: Configure Environment Variables

### 4.1 Create Production Environment File

```bash
nano .env.production
```

### 4.2 Add the Following Content

Copy and paste this, then replace with your actual values:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_live_YOUR_ACTUAL_STRIPE_SECRET_KEY
STRIPE_PRODUCT_ID=prod_YOUR_ACTUAL_PRODUCT_ID

# Application URL (use your domain)
NEXT_PUBLIC_BASE_URL=https://yourdomain.com

# Environment
NODE_ENV=production
```

**Important:** 
- Replace `sk_live_YOUR_ACTUAL_STRIPE_SECRET_KEY` with your real Stripe secret key
- Replace `prod_YOUR_ACTUAL_PRODUCT_ID` with your real Stripe product ID
- Replace `yourdomain.com` with your actual domain name

### 4.3 Save and Exit

- Press `Ctrl + X`
- Press `Y` to confirm
- Press `Enter` to save

### 4.4 Secure the Environment File

```bash
chmod 600 .env.production
```

---

## Step 5: Build and Start the Application

### 5.1 Build and Run with Docker Compose

```bash
docker compose up -d --build
```

This command will:
- Download Node.js image
- Install all npm dependencies
- Build the Next.js application
- Start the container in background

### 5.2 Verify Application is Running

```bash
# Check container status
docker compose ps

# View logs
docker compose logs -f web

# Test the application
curl http://localhost:3000
```

The application should now be running on port 3000.

---

## Step 6: Install and Configure Nginx

### 6.1 Install Nginx

```bash
sudo apt install -y nginx
```

### 6.2 Create Nginx Configuration

```bash
sudo nano /etc/nginx/sites-available/m4d
```

### 6.3 Add the Following Configuration

Replace `yourdomain.com` with your actual domain:

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

### 6.4 Enable the Site

```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/m4d /etc/nginx/sites-enabled/

# Remove default site (optional)
sudo rm /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
```

### 6.5 Verify Nginx is Working

```bash
curl http://yourdomain.com
# or visit http://yourdomain.com in your browser
```

---

## Step 7: Install SSL Certificate (HTTPS)

### 7.1 Install Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
```

### 7.2 Obtain SSL Certificate

Replace `yourdomain.com` with your actual domain:

```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

Follow the prompts:
- Enter your email address
- Agree to Terms of Service (Y)
- Choose whether to share email (optional)
- Select option 2 to redirect HTTP to HTTPS (recommended)

### 7.3 Verify SSL Certificate

```bash
# Test certificate renewal
sudo certbot renew --dry-run

# Check certificate expiry
sudo certbot certificates
```

### 7.4 Set Up Auto-Renewal

Certbot automatically sets up a cron job for renewal. Verify it:

```bash
sudo systemctl status certbot.timer
```

---

## Step 8: Final Verification

### 8.1 Check All Services

```bash
# Check Docker container
docker compose ps

# Check Nginx
sudo systemctl status nginx

# Check SSL certificate
curl -I https://yourdomain.com
```

### 8.2 Test Application in Browser

Visit `https://yourdomain.com` - you should see:
- Valid SSL certificate (lock icon)
- Your application running
- HTTPS enabled

---

## Step 9: Management Commands

### Application Management

```bash
# View logs
docker compose logs -f web

# Restart application
docker compose restart

# Stop application
docker compose down

# Update application (after git pull)
git pull
docker compose up -d --build

# Remove everything and rebuild
docker compose down
docker system prune -a
docker compose up -d --build
```

### Nginx Management

```bash
# Restart Nginx
sudo systemctl restart nginx

# Test configuration
sudo nginx -t

# View Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### SSL Certificate Management

```bash
# Renew certificates manually
sudo certbot renew

# Check certificate status
sudo certbot certificates

# Revoke certificate (if needed)
sudo certbot revoke --cert-name yourdomain.com
```

---

## Troubleshooting

### Application Not Starting

```bash
# Check Docker logs
docker compose logs -f web

# Check if port 3000 is in use
sudo netstat -tlnp | grep 3000

# Rebuild from scratch
docker compose down -v
docker compose up -d --build
```

### Nginx Issues

```bash
# Check Nginx error logs
sudo tail -f /var/log/nginx/error.log

# Test configuration
sudo nginx -t

# Check if port 80/443 is available
sudo netstat -tlnp | grep :80
sudo netstat -tlnp | grep :443
```

### SSL Certificate Issues

```bash
# Check certificate status
sudo certbot certificates

# Renew certificate
sudo certbot renew --force-renewal

# Check Nginx SSL configuration
sudo nano /etc/nginx/sites-available/m4d
```

### Environment Variables Not Loading

```bash
# Verify .env.production exists
ls -la /opt/m4d/.env.production

# Check file permissions
chmod 600 /opt/m4d/.env.production

# Restart container
docker compose restart
```

---

## Security Best Practices

### 1. Keep System Updated

```bash
sudo apt update && sudo apt upgrade -y
```

### 2. Secure SSH Access

```bash
# Edit SSH config
sudo nano /etc/ssh/sshd_config

# Disable root login
# Set: PermitRootLogin no

# Restart SSH
sudo systemctl restart sshd
```

### 3. Monitor Logs Regularly

```bash
# Application logs
docker compose logs --tail=100 web

# Nginx access logs
sudo tail -f /var/log/nginx/access.log

# System logs
sudo journalctl -f
```

### 4. Backup Configuration

```bash
# Backup environment file
sudo cp /opt/m4d/.env.production /opt/m4d/.env.production.backup

# Backup Nginx config
sudo cp /etc/nginx/sites-available/m4d /opt/m4d/nginx.backup
```

---

## Quick Reference

| Task | Command |
|------|---------|
| Start application | `docker compose up -d` |
| Stop application | `docker compose down` |
| View logs | `docker compose logs -f web` |
| Restart app | `docker compose restart` |
| Update app | `git pull && docker compose up -d --build` |
| Restart Nginx | `sudo systemctl restart nginx` |
| Renew SSL | `sudo certbot renew` |
| Check status | `docker compose ps` |

---

## File Locations

| Item | Location |
|------|----------|
| Application code | `/opt/m4d/` |
| Environment variables | `/opt/m4d/.env.production` |
| Nginx config | `/etc/nginx/sites-available/m4d` |
| SSL certificates | `/etc/letsencrypt/live/yourdomain.com/` |
| Application logs | `docker compose logs web` |
| Nginx logs | `/var/log/nginx/` |

---

## Support

If you encounter issues:

1. Check application logs: `docker compose logs -f web`
2. Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`
3. Verify all services are running: `docker compose ps` and `sudo systemctl status nginx`
4. Test connectivity: `curl http://localhost:3000`

For updates: `git pull && docker compose up -d --build`
