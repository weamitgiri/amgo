# AWS Ubuntu 24.04 — Full Deployment Guide (No Build Mode)

Deploy this project on a fresh AWS EC2 Ubuntu 24.04 server, cloned from GitHub,
running **without build** (frontend via `vite dev`, APIs via `nodemon`), managed by PM2,
served by Nginx.

## Architecture on the server

```
                     ┌────────────────────────────────┐
 Browser ── 80/443 ─▶│          NGINX                 │
                     └───────────────┬────────────────┘
   /              ──▶ 127.0.0.1:5173   frontend/  (npm run dev, PM2)
   /v1/*          ──▶ 127.0.0.1:6001   apis/      (npm run dev, PM2)
   /socket.io/*   ──▶ 127.0.0.1:6001   Socket.IO  (same Node process)
   /admin/*       ──▶ PHP-FPM 8.3      Laravel admin panel (repo root)
   /storage/*     ──▶ static files     Laravel public/storage
                                │
                           MySQL 8 (db: ppp)
```

- **Domain root `/`** → `frontend/` website (TanStack Start, dev mode)
- **`/v1/...`** → Node.js APIs from `apis/` folder (port 6001)
- **`/admin/login`** → Laravel admin panel (repo root project)
- Everything lives in **`/var/www/html/p`**

> ⚠️ Note: dev-mode (no build) works, but uses more RAM/CPU than a production build.
> Use at least a **t3.medium (4 GB RAM)** instance, or add swap (Step 2.3).

---

## PART 1 — Launch EC2 Instance

1. AWS Console → EC2 → **Launch Instance**
2. Name: `amgo-server`
3. AMI: **Ubuntu Server 24.04 LTS (64-bit x86)**
4. Instance type: **t3.medium** (minimum recommended; t3.small + swap also works)
5. Key pair: create/download `.pem` file (e.g. `amgo-key.pem`)
6. Network settings → Security Group inbound rules:

   | Type  | Port | Source    |
   |-------|------|-----------|
   | SSH   | 22   | My IP     |
   | HTTP  | 80   | 0.0.0.0/0 |
   | HTTPS | 443  | 0.0.0.0/0 |

7. Storage: **20 GB** gp3
8. Launch, then EC2 → **Elastic IPs** → Allocate → **Associate** with this instance
   (Elastic IP zaroori hai — warna reboot par IP change ho jayega)

---

## PART 2 — Connect & Prepare Server

### 2.1 SSH connect (from your Mac)

```bash
chmod 400 ~/Downloads/amgo-key.pem
ssh -i ~/Downloads/amgo-key.pem ubuntu@YOUR_ELASTIC_IP
```

### 2.2 System update

```bash
sudo apt update && sudo apt upgrade -y
sudo timedatectl set-timezone Asia/Kolkata
```

### 2.3 Add swap (2 GB) — dev mode ke liye important

```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
free -h   # verify swap dikhna chahiye
```

---

## PART 3 — Install Node.js 22 + PM2

Vite 7 needs Node ≥ 20.19, so install Node 22 LTS:

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
node -v    # v22.x
npm -v

sudo npm install -g pm2
pm2 -v
```

---

## PART 4 — Install PHP 8.3 + Composer (for Laravel admin)

Ubuntu 24.04 ships PHP 8.3 by default (Laravel 11 needs `^8.2` — compatible):

```bash
sudo apt install -y php8.3-fpm php8.3-cli php8.3-mysql php8.3-mbstring \
  php8.3-xml php8.3-curl php8.3-zip php8.3-gd php8.3-bcmath php8.3-intl unzip

php -v
sudo systemctl enable --now php8.3-fpm

# Composer
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer
composer -V
```

---

## PART 5 — Install MySQL & Create Database

```bash
sudo apt install -y mysql-server
sudo systemctl enable --now mysql
sudo mysql_secure_installation   # prompts follow karo (root password set karo)
```

Create DB + user:

```bash
sudo mysql
```

```sql
CREATE DATABASE ppp CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'amgo_user'@'localhost' IDENTIFIED BY 'CHANGE_THIS_STRONG_PASSWORD';
GRANT ALL PRIVILEGES ON ppp.* TO 'amgo_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 5.1 (Optional) Import existing local data

On your **local Mac**:

```bash
mysqldump -u root -p ppp > ppp_dump.sql
scp -i ~/Downloads/amgo-key.pem ppp_dump.sql ubuntu@YOUR_ELASTIC_IP:/home/ubuntu/
```

On the **server**:

```bash
mysql -u amgo_user -p ppp < /home/ubuntu/ppp_dump.sql
```

---

## PART 6 — Install Nginx

```bash
sudo apt install -y nginx
sudo systemctl enable --now nginx
# Browser me http://YOUR_ELASTIC_IP kholo → "Welcome to nginx" dikhna chahiye
```

---

## PART 7 — Create /var/www/html & Clone from GitHub

### 7.1 Folder create + ownership

```bash
sudo mkdir -p /var/www/html
sudo chown -R ubuntu:ubuntu /var/www/html
```

### 7.2 GitHub deploy key (private repo access)

```bash
ssh-keygen -t ed25519 -C "aws-amgo-server" -f ~/.ssh/id_ed25519 -N ""
cat ~/.ssh/id_ed25519.pub
```

Copy the printed key → GitHub → repo **weamitgiri/amgo** → **Settings → Deploy keys →
Add deploy key** → paste → save (read-only is enough).

### 7.3 Clone

```bash
cd /var/www/html
git clone git@github.com:weamitgiri/amgo.git p
cd /var/www/html/p
ls   # frontend/  apis/  app/  public/  artisan ... dikhna chahiye
```

---

## PART 8 — Laravel Admin Panel Setup (repo root)

```bash
cd /var/www/html/p
composer install --no-dev --optimize-autoloader
```

### 8.1 Edit `.env` (repo me committed hai, live values daalo)

```bash
nano /var/www/html/p/.env
```

Change these lines:

```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://yourdomain.com

DB_HOST=127.0.0.1
DB_DATABASE=ppp
DB_USERNAME=amgo_user
DB_PASSWORD=CHANGE_THIS_STRONG_PASSWORD
```

### 8.2 Artisan setup

```bash
cd /var/www/html/p
php artisan key:generate        # sirf tab agar APP_KEY empty hai
php artisan storage:link
php artisan migrate --force     # DB dump import kiya hai to ye skip kar sakte ho
php artisan config:cache
php artisan route:cache
```

### 8.3 Permissions (PHP-FPM runs as www-data)

```bash
sudo chown -R ubuntu:www-data /var/www/html/p/storage /var/www/html/p/bootstrap/cache
sudo chmod -R 775 /var/www/html/p/storage /var/www/html/p/bootstrap/cache
```

---

## PART 9 — Node APIs Setup (`apis/` folder, port 6001)

```bash
cd /var/www/html/p/apis
npm install
```

### 9.1 Create `apis/.env` (git me nahi hai — naya banana padega)

```bash
nano /var/www/html/p/apis/.env
```

```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=amgo_user
DB_PASSWORD=CHANGE_THIS_STRONG_PASSWORD
DB_NAME=ppp
PORT=6001
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com,http://yourdomain.com
JWT_SECRET=GENERATE_A_NEW_64_CHAR_RANDOM_SECRET
NODE_ENV=production

MAIL_HOST=smtp-relay.sendinblue.com
MAIL_PORT=587
MAIL_USERNAME=your_mail_username
MAIL_PASSWORD=your_mail_password
MAIL_FROM_ADDRESS=support@yourdomain.com
MAIL_FROM_NAME=Zoventro
```

New JWT secret generate karne ke liye: `openssl rand -hex 32`

### 9.2 Start with PM2 (no build — nodemon dev mode)

```bash
cd /var/www/html/p/apis
pm2 start npm --name apis -- run dev
pm2 logs apis --lines 20   # "Node.js API running on port 6001" dikhna chahiye
curl http://127.0.0.1:6001/v1/public/health 2>/dev/null || echo "route check karo"
```

---

## PART 10 — Frontend Setup (`frontend/` folder, port 5173)

```bash
cd /var/www/html/p/frontend
npm install
```

### 10.1 Edit `frontend/.env` (live values)

```bash
nano /var/www/html/p/frontend/.env
```

```env
# Empty rakho — browser /v1 par call karega, nginx directly API ko bhejega
VITE_API_BASE_URL=

# Vite dev proxy (same server par API)
VITE_API_PROXY_TARGET=http://localhost:6001

# Socket.IO — nginx /socket.io/ proxy ke through
VITE_SOCKET_URL=https://yourdomain.com

# Laravel storage (activity images)
VITE_STORAGE_BASE_URL=https://yourdomain.com/storage

VITE_API_TIMEOUT=30000
```

### 10.2 Edit `frontend/vite.config.ts` — domain allow karo

Vite dev server unknown Host header block karta hai. Nginx ke through domain se
request aayegi, isliye `allowedHosts` add karna **zaroori** hai:

```ts
export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
  vite: {
    server: {
      port: 5173,
      strictPort: true,
      allowedHosts: ["yourdomain.com", "www.yourdomain.com"],
      proxy: {
        "/v1": {
          target: process.env.VITE_API_PROXY_TARGET || "http://localhost:6001",
          changeOrigin: true,
        },
      },
    },
  },
});
```

### 10.3 Start with PM2 (no build — vite dev mode)

```bash
cd /var/www/html/p/frontend
pm2 start npm --name frontend -- run dev
pm2 logs frontend --lines 20   # "Local: http://localhost:5173/" dikhna chahiye
```

### 10.4 PM2 auto-start on reboot

```bash
pm2 startup systemd
# Ye jo command print kare (sudo env PATH=... wali), usko copy karke run karo
pm2 save
pm2 list   # apis + frontend dono "online" hone chahiye
```

---

## PART 11 — Nginx Site Configuration (domain routing)

```bash
sudo nano /etc/nginx/sites-available/amgo
```

Paste (replace `yourdomain.com` everywhere):

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Laravel public folder (admin panel + storage)
    root /var/www/html/p/public;
    index index.php;

    client_max_body_size 50M;

    # ---------- Node APIs (apis/ folder) ----------
    location /v1/ {
        proxy_pass http://127.0.0.1:6001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # ---------- Socket.IO (same Node process) ----------
    location /socket.io/ {
        proxy_pass http://127.0.0.1:6001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }

    # ---------- Laravel admin panel ----------
    location ^~ /admin {
        try_files $uri /index.php?$query_string;
    }

    # ---------- Laravel static files ----------
    location ^~ /storage/ { try_files $uri =404; }
    location ^~ /imagess/ { try_files $uri =404; }
    location ^~ /front/   { try_files $uri =404; }
    location ^~ /build/   { try_files $uri =404; }

    location ~ \.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/run/php/php8.3-fpm.sock;
    }

    location ~ /\.(?!well-known) { deny all; }

    # ---------- Frontend website (default — sab kuch frontend par) ----------
    location / {
        proxy_pass http://127.0.0.1:5173;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable it:

```bash
sudo ln -s /etc/nginx/sites-available/amgo /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t          # "syntax is ok" aana chahiye
sudo systemctl reload nginx
```

---

## PART 12 — Domain DNS + SSL

### 12.1 DNS (GoDaddy/Namecheap/Route53 — jahan bhi domain hai)

| Type | Name | Value            |
|------|------|------------------|
| A    | @    | YOUR_ELASTIC_IP  |
| A    | www  | YOUR_ELASTIC_IP  |

Propagation check: `dig +short yourdomain.com` (server ka IP aana chahiye)

### 12.2 Free SSL (Let's Encrypt)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
# Email do, redirect option me "2: Redirect" choose karo
```

Auto-renew already enabled hota hai. Test: `sudo certbot renew --dry-run`

---

## PART 13 — Final Verification Checklist

```bash
pm2 list                          # apis + frontend online
sudo systemctl status nginx       # active (running)
sudo systemctl status php8.3-fpm  # active (running)
sudo systemctl status mysql       # active (running)
```

Browser me check karo:

| URL                                  | Expected                    |
|--------------------------------------|-----------------------------|
| `https://yourdomain.com`             | Frontend website            |
| `https://yourdomain.com/admin/login` | Laravel admin login page    |
| `https://yourdomain.com/v1/public/...` | API JSON response         |

---

## PART 14 — LIVE PAR KIN FILES ME CHANGE HOGA (Summary)

Local → Live jaate waqt **sirf ye 4 files** change hoti hain:

### 1. `.env` (root — Laravel admin)
```
APP_ENV=production          (local me: local)
APP_DEBUG=false
APP_URL=https://yourdomain.com     (local me: http://localhost/p/)
DB_USERNAME / DB_PASSWORD → server ke MySQL user ke
```

### 2. `apis/.env` (git me NAHI hai — server par naya banana hai)
```
DB_USER / DB_PASSWORD / DB_NAME → server MySQL
CORS_ORIGINS=https://yourdomain.com,...   (local me localhost list)
NODE_ENV=production
JWT_SECRET=naya random secret
```

### 3. `frontend/.env`
```
VITE_API_BASE_URL=                          (empty hi rehta hai)
VITE_SOCKET_URL=https://yourdomain.com      (local me: http://localhost:6001)
VITE_STORAGE_BASE_URL=https://yourdomain.com/storage   (local me: http://localhost/p/public/storage)
```

### 4. `frontend/vite.config.ts`
```
server.allowedHosts me domain add karna (zaroori — warna Vite "Blocked request" dega)
server.port: 5173 + strictPort: true
```

Baaki sab (nginx config, PM2) server-side hai, repo me nahi.

---

## PART 15 — Live Par Update Push Karna (redeploy)

Local se code push karo, phir server par:

```bash
cd /var/www/html/p
git pull origin main

# Sirf agar package.json badla ho:
cd apis && npm install && cd ..
cd frontend && npm install && cd ..

# Sirf agar composer.json / migrations badle ho:
composer install --no-dev --optimize-autoloader
php artisan migrate --force
php artisan config:cache && php artisan route:cache

# Restart (nodemon/vite auto-reload karte hain, but safe side):
pm2 restart apis frontend
```

> Note: `git pull` server ke edited files (`frontend/.env`, `frontend/vite.config.ts`)
> par conflict de sakta hai agar wahi files repo me bhi badli ho. Tab:
> `git stash && git pull && git stash pop`

---

## PART 16 — Troubleshooting

```bash
pm2 logs apis --lines 50          # API errors
pm2 logs frontend --lines 50      # Frontend/Vite errors
sudo tail -50 /var/log/nginx/error.log
tail -50 /var/www/html/p/storage/logs/laravel.log
```

| Problem | Fix |
|---------|-----|
| "Blocked request. This host is not allowed" | `vite.config.ts` me `allowedHosts` add karo (Part 10.2) |
| 502 Bad Gateway on `/` | `pm2 list` — frontend crashed? `pm2 logs frontend` |
| 502 on `/v1/` | apis process check karo: `pm2 logs apis` |
| Admin panel 404 | nginx `root` path check karo: `/var/www/html/p/public` |
| Admin 500 error | storage permissions (Part 8.3) + `laravel.log` dekho |
| API DB error | `apis/.env` ke DB creds MySQL user se match karo |
| Socket connect nahi ho raha | `VITE_SOCKET_URL` + nginx `/socket.io/` block + `CORS_ORIGINS` |
| npm install killed / hang | Swap add karo (Part 2.3) |

---

## ⚠️ Security Notes

1. **`.env` (root) aur `frontend/.env` git me committed hain** — inme secrets hain
   (APP_KEY, mail password). Better: `git rm --cached .env frontend/.env` karke
   sirf `.env.example` rakho.
2. **`amigo`/`clear` private SSH keys repo root me committed hain** — inhe repo se
   hatao aur GitHub par ye keys revoke karo.
3. `apis/.env` ka **JWT_SECRET live par naya** generate karo (local wala use mat karo).
4. MySQL me strong password rakho; root user application ke liye use mat karo.
