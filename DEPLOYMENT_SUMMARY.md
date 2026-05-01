# M4D Application - Server Deployment Summary

**Repository:** https://github.com/jayeshk99/m4d.git

---

## What You Need Before Starting

1. **Server:** Ubuntu 20.04+ or Debian Linux
2. **Access:** Root or sudo privileges
3. **Domain:** Your domain pointed to server IP (e.g., yourdomain.com)
4. **Stripe Credentials:**
   - Stripe Secret Key (starts with `sk_live_` or `sk_test_`)
   - Stripe Product ID (starts with `prod_`)

---

## Installation Overview (30-45 minutes)

1. ✅ Install Docker
2. ✅ Clone application from GitHub
3. ✅ Configure environment variables (.env.production file)
4. ✅ Start application with Docker
5. ✅ Install Nginx as reverse proxy
6. ✅ Install SSL certificate (free from Let's Encrypt)

---

## Environment Variables File

**File Name:** `.env.production`  
**Location:** `/opt/m4d/.env.production`

**Required Content:**

```env
STRIPE_SECRET_KEY=sk_live_your_actual_stripe_secret_key_here
STRIPE_PRODUCT_ID=prod_your_actual_product_id_here
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
NODE_ENV=production
```

**Important:** Replace the placeholder values with your actual Stripe credentials and domain.

---

## Key Commands

### Initial Deployment

```bash
# Clone repository
git clone https://github.com/jayeshk99/m4d.git
cd m4d

# Create and edit environment file
nano .env.production
# (paste the content above with your actual values)

# Start application
docker compose up -d --build
```

### Daily Operations

```bash
# View logs
docker compose logs -f web

# Restart application
docker compose restart

# Update application
git pull
docker compose up -d --build

# Stop application
docker compose down
```

---

## After Deployment

**Application will be accessible at:**

- Direct: http://server-ip:3000
- With Nginx: http://yourdomain.com
- With SSL: https://yourdomain.com (recommended for production)

**The application includes:**

- Automatic restarts on failure
- Background process management via Docker
- All Node.js dependencies bundled

---

## Support Documentation

Choose based on your experience level:

| Document                                     | Best For                                              |
| -------------------------------------------- | ----------------------------------------------------- |
| **[SETUP_CHECKLIST.md](SETUP_CHECKLIST.md)** | Experienced admins who want quick copy-paste commands |
| **[SERVER_SETUP.md](SERVER_SETUP.md)**       | Complete step-by-step guide with explanations         |
| **[DEPLOYMENT.md](DEPLOYMENT.md)**           | Docker management and troubleshooting reference       |

---

## Quick Health Check

After deployment, verify everything works:

```bash
# 1. Check Docker container is running
docker compose ps
# Expected: Status shows "Up"

# 2. Check application responds
curl http://localhost:3000
# Expected: HTML response

# 3. Check Nginx (if installed)
sudo systemctl status nginx
# Expected: "active (running)"

# 4. Check from browser
# Visit: https://yourdomain.com
# Expected: Application loads with valid SSL certificate
```

---

## Emergency Contact Commands

**If something goes wrong:**

```bash
# View application logs
docker compose logs -f web

# View Nginx logs
sudo tail -f /var/log/nginx/error.log

# Restart everything
docker compose restart
sudo systemctl restart nginx

# Complete rebuild
docker compose down
docker compose up -d --build
```

---

## Technical Architecture

```
Internet (HTTPS)
    ↓
Nginx (Port 80/443) - Handles SSL, Reverse Proxy
    ↓
Docker Container (Port 3000) - Next.js Application
    ↓
Stripe API - Payment Processing
```

**Components:**

- **Next.js 16** - Web framework
- **Docker** - Application containerization
- **Nginx** - Web server and reverse proxy
- **Let's Encrypt** - Free SSL certificates
- **Stripe** - Payment processing

---

## Estimated Time & Resources

| Task                | Time          | Skills Required       |
| ------------------- | ------------- | --------------------- |
| Docker installation | 5-10 min      | Basic Linux           |
| Application setup   | 10-15 min     | Copy-paste commands   |
| Nginx configuration | 5-10 min      | Basic text editing    |
| SSL certificate     | 5-10 min      | Following prompts     |
| **Total**           | **30-45 min** | **Beginner-friendly** |

**Server Requirements:**

- 1 GB RAM minimum (2 GB recommended)
- 10 GB disk space
- 1 CPU core minimum

---

## Security Notes

✅ **Included:**

- HTTPS/SSL encryption
- Automatic security updates (Docker container)
- Firewall configuration instructions

⚠️ **You Should:**

- Keep environment file (.env.production) secret
- Use strong passwords for server access
- Keep server packages updated
- Use Stripe live keys only in production

---

## Getting Help

1. Check logs first: `docker compose logs -f web`
2. Review troubleshooting section in SERVER_SETUP.md
3. Ensure domain DNS is properly configured
4. Verify Stripe credentials are correct

**Common Issues:**

- Port already in use → Check if another service uses port 3000, 80, or 443
- SSL fails → Ensure domain points to server before running certbot
- Application won't start → Check .env.production file exists and has correct values

---

**Ready to start?** See [SETUP_CHECKLIST.md](SETUP_CHECKLIST.md) for copy-paste commands!
