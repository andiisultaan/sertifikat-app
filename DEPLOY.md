# Panduan Deploy ke VPS

## 1. Persiapan VPS

```bash
# Update sistem (Ubuntu/Debian)
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
newgrp docker

# Install Docker Compose v2
sudo apt install docker-compose-plugin -y

# Install Git
sudo apt install git -y
```

---

## 2. Clone Repo

```bash
cd /var/www
sudo git clone https://github.com/andiisultaan/sertifikat-app.git
sudo chown -R $USER:$USER sertifikat-app
cd sertifikat-app
```

---

## 3. Buat File `.env` Backend

```bash
cp backend/.env.example backend/.env
nano backend/.env
```

Set nilai-nilai berikut:

```env
APP_NAME="Sertifikat UKK"
APP_ENV=production
APP_DEBUG=false
APP_URL=http://<IP_VPS_ATAU_DOMAIN>:8000

DB_CONNECTION=mysql
DB_HOST=db
DB_PORT=3306
DB_DATABASE=sertifikat_ukk
DB_USERNAME=sertifikat_user
DB_PASSWORD=sertifikat_pass

CACHE_DRIVER=redis
QUEUE_CONNECTION=redis
SESSION_DRIVER=redis

REDIS_HOST=redis
REDIS_PORT=6379

SANCTUM_STATEFUL_DOMAINS=<IP_VPS_ATAU_DOMAIN>:3000
```

---

## 4. Sesuaikan `docker-compose.yml`

Edit environment `NEXT_PUBLIC_API_URL` pada service `frontend`:

```bash
nano docker-compose.yml
```

Ubah:

```yaml
environment:
  - NEXT_PUBLIC_API_URL=http://<IP_VPS_ATAU_DOMAIN>:8000/api
```

---

## 5. Build & Jalankan Container

```bash
docker compose up -d --build
```

---

## 6. Generate APP_KEY & Setup Database

```bash
# Generate key
docker exec sertifikat_app php artisan key:generate

# Jalankan migrasi + seeder
docker exec sertifikat_app php artisan migrate --seed --force

# Link storage
docker exec sertifikat_app php artisan storage:link

# Cache config untuk production
docker exec sertifikat_app php artisan config:cache
docker exec sertifikat_app php artisan route:cache
```

---

## 7. Cek Status Container

```bash
docker compose ps
```

Semua container harus berstatus `Up`:

| Container             | Keterangan           | Port |
| --------------------- | -------------------- | ---- |
| `sertifikat_nginx`    | Backend API          | 8000 |
| `sertifikat_frontend` | Frontend Next.js     | 3000 |
| `sertifikat_db`       | MySQL Database       | 3306 |
| `sertifikat_redis`    | Redis Queue/Cache    | 6379 |
| `sertifikat_queue`    | Laravel Queue Worker | —    |

---

## 8. (Opsional) Domain + HTTPS dengan Nginx & Certbot

### Install Nginx dan Certbot

```bash
sudo apt install nginx certbot python3-certbot-nginx -y
```

### Buat Konfigurasi Nginx Host

Buat file `/etc/nginx/sites-available/sertifikat`:

```nginx
server {
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

server {
    server_name app.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Aktifkan dan Pasang SSL

```bash
sudo ln -s /etc/nginx/sites-available/sertifikat /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Pasang SSL otomatis
sudo certbot --nginx -d api.yourdomain.com -d app.yourdomain.com
```

### Update ENV setelah Domain Aktif

Edit `backend/.env`:

```env
APP_URL=https://api.yourdomain.com
SANCTUM_STATEFUL_DOMAINS=app.yourdomain.com
```

Update `docker-compose.yml`:

```yaml
environment:
  - NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
```

Rebuild frontend dan refresh cache:

```bash
docker compose up -d --build frontend
docker exec sertifikat_app php artisan config:cache
```

---

## Perintah Berguna

```bash
# Lihat log semua container
docker compose logs -f

# Lihat log container tertentu
docker compose logs -f app
docker compose logs -f frontend

# Restart semua container
docker compose restart

# Pull update terbaru & rebuild
git pull
docker compose up -d --build

# Masuk ke shell container backend
docker exec -it sertifikat_app bash

# Jalankan artisan command
docker exec sertifikat_app php artisan <command>
```
