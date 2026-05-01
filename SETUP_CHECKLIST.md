# Quick Setup Checklist

Use this as a quick reference while setting up the server. For detailed instructions, see [SERVER_SETUP.md](SERVER_SETUP.md)

---

## ✅ Pre-Deployment Checklist

- [ ] Server with Ubuntu 20.04/22.04 or Debian
- [ ] Root/sudo access
- [ ] Domain name pointed to server IP
- [ ] Ports 22, 80, 443 open
- [ ] Stripe Secret Key ready
- [ ] Stripe Product ID ready

---

## 📋 Setup Commands (Copy & Paste)

### 1. System Setup
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git ufw
sudo ufw allow 22/tcp && sudo ufw allow 80/tcp && sudo ufw allow 443/tcp
sudo ufw enable
```

### 2. Install Docker
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
sudo systemctl enable docker && sudo systemctl start docker
```
**⚠️ Log out and log back in after this step**

### 3. Clone Application
```bash
cd /opt
git clone https://github.com/jayeshk99/m4d.git
cd m4d
```

### 4. Create Environment File
```bash
nano .env.production
```

**Paste this and edit with your actual values:**
```env
STRIPE_SECRET_KEY=sk_live_YOUR_ACTUAL_KEY
STRIPE_PRODUCT_ID=prod_YOUR_ACTUAL_ID
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
NODE_ENV=production
```

Save: `Ctrl+X`, then `Y`, then `Enter`

```bash
chmod 600 .env.production
```

### 5. Start Application
```bash
docker compose up -d --build
```

**Wait 2-5 minutes for build to complete**

Verify: `docker compose logs -f web` (Ctrl+C to exit)

### 6. Install Nginx
```bash
sudo apt install -y nginx
sudo nano /etc/nginx/sites-available/m4d
```

**Paste this (replace yourdomain.com):**
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

Save and enable:
```bash
sudo ln -s /etc/nginx/sites-available/m4d /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx && sudo systemctl enable nginx
```

### 7. Install SSL Certificate
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

Follow prompts and select option 2 (redirect HTTP to HTTPS)

---

## 🧪 Verification

```bash
# Check Docker
docker compose ps

# Check Nginx
sudo systemctl status nginx

# Test HTTPS
curl -I https://yourdomain.com

# View logs
docker compose logs -f web
```

---

## 🔧 Common Commands

```bash
# View application logs
docker compose logs -f web

# Restart application
docker compose restart

# Update application
cd /opt/m4d
git pull
docker compose up -d --build

# Restart Nginx
sudo systemctl restart nginx

# Renew SSL
sudo certbot renew

# Check SSL expiry
sudo certbot certificates
```

---

## ⚠️ Important Notes

1. **After Docker installation:** Log out and log back in
2. **Build time:** First `docker compose up` takes 2-5 minutes
3. **Port check:** Ensure nothing else uses port 3000, 80, or 443
4. **DNS:** Domain must point to server IP before SSL installation
5. **Stripe:** Use test keys for testing, live keys for production

---

## 📍 File Locations

| Item | Path |
|------|------|
| App code | `/opt/m4d/` |
| Environment | `/opt/m4d/.env.production` |
| Nginx config | `/etc/nginx/sites-available/m4d` |
| SSL certs | `/etc/letsencrypt/live/yourdomain.com/` |

---

## 🆘 Troubleshooting Quick Fixes

**App not starting?**
```bash
docker compose logs web
docker compose down && docker compose up -d --build
```

**Nginx error?**
```bash
sudo nginx -t
sudo tail -f /var/log/nginx/error.log
```

**SSL issues?**
```bash
sudo certbot certificates
sudo certbot renew --dry-run
```

**Port already in use?**
```bash
sudo netstat -tlnp | grep :3000
sudo netstat -tlnp | grep :80
```

---

## ✅ Success Indicators

- [ ] `docker compose ps` shows container as "Up"
- [ ] Can access http://localhost:3000 from server
- [ ] Nginx running: `sudo systemctl status nginx`
- [ ] Can access https://yourdomain.com from browser
- [ ] Browser shows lock icon (valid SSL)
- [ ] Application loads correctly
- [ ] No errors in logs

---

**For detailed explanations, see [SERVER_SETUP.md](SERVER_SETUP.md)**
