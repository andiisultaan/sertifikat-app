# Panduan Deploy ke VPS Menggunakan FileZilla

> Deploy manual tanpa Git — cocok untuk shared hosting atau VPS tanpa akses Git.

---

## Prasyarat

| Kebutuhan                   | Keterangan                                |
| --------------------------- | ----------------------------------------- |
| **FileZilla**               | Download di https://filezilla-project.org |
| **SSH Client**              | PuTTY (Windows) atau terminal bawaan      |
| **VPS**                     | Ubuntu/Debian dengan akses root           |
| **Docker & Docker Compose** | Terinstall di VPS                         |

---

## Tahap 1 — Persiapan Proyek di Komputer Lokal

### 1.1 Build Frontend (Next.js) untuk Production

Buka terminal di folder proyek:

```bash
cd frontend
npm install
npm run build
```

Pastikan folder `.next` dan `public` sudah terbentuk di dalam `frontend/`.

### 1.2 Install Dependency Backend (Composer)

```bash
cd backend
composer install --optimize-autoloader --no-dev
```

Pastikan folder `vendor/` sudah lengkap di dalam `backend/`.

### 1.3 Buat File `.env` Backend

Salin dan sesuaikan file env:

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env` dan isi nilai berikut:

```env
APP_NAME="Sertifikat UKK"
APP_ENV=production
APP_KEY=        # akan di-generate di VPS
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

### 1.4 Edit `docker-compose.yml`

Ubah nilai `NEXT_PUBLIC_API_URL` pada service `frontend`:

```yaml
environment:
  - NEXT_PUBLIC_API_URL=http://<IP_VPS_ATAU_DOMAIN>:8000/api
```

---

## Tahap 2 — Koneksi ke VPS via FileZilla

### 2.1 Buka FileZilla dan Masuk ke Site Manager

1. Klik **File → Site Manager** (atau tekan `Ctrl+S`)
2. Klik **New Site** dan beri nama, contoh: `Sertifikat VPS`
3. Isi detail koneksi:

| Field          | Nilai                                   |
| -------------- | --------------------------------------- |
| **Protocol**   | `SFTP - SSH File Transfer Protocol`     |
| **Host**       | IP VPS kamu (contoh: `103.xxx.xxx.xxx`) |
| **Port**       | `22`                                    |
| **Logon Type** | `Normal`                                |
| **User**       | `root` atau nama user VPS               |
| **Password**   | Password SSH VPS                        |

4. Klik **Connect**

> Jika menggunakan SSH Key, pilih **Logon Type: Key file** dan arahkan ke file `.pem` atau `.ppk`.

---

## Tahap 3 — Upload File ke VPS

### 3.1 Buat Folder Tujuan di VPS

Melalui SSH (PuTTY), buat direktori:

```bash
mkdir -p /var/www/sertifikat-app
```

### 3.2 Upload via FileZilla

Di FileZilla:

- **Panel kiri (Local)** → arahkan ke folder proyek lokal: `D:\yubi\sertifikat-app`
- **Panel kanan (Remote)** → navigasi ke `/var/www/sertifikat-app`

Upload file dan folder berikut (seleksi semua lalu drag ke panel kanan):

| File/Folder          | Keterangan                                          |
| -------------------- | --------------------------------------------------- |
| `backend/`           | Seluruh folder backend Laravel                      |
| `frontend/`          | Seluruh folder frontend Next.js (termasuk `.next/`) |
| `docker/`            | Konfigurasi Nginx                                   |
| `docker-compose.yml` | Orkestrasi container                                |

> **Tips FileZilla:** Klik kanan di panel remote → **Create directory** untuk membuat folder baru.
> Untuk upload folder besar, gunakan **Queue** agar bisa dipantau progresnya.

### 3.3 File yang Harus Ada Sebelum Lanjut

Pastikan di `/var/www/sertifikat-app` sudah terdapat:

```
/var/www/sertifikat-app/
├── backend/
│   ├── .env              ← wajib ada
│   ├── vendor/           ← hasil composer install
│   └── ...
├── frontend/
│   ├── .next/            ← hasil npm run build
│   └── ...
├── docker/
│   └── nginx/
│       └── default.conf
└── docker-compose.yml
```

---

## Tahap 4 — Setup VPS via SSH

Buka terminal SSH (PuTTY atau terminal):

```bash
ssh root@<IP_VPS>
cd /var/www/sertifikat-app
```

### 4.1 Set Permission File

```bash
chown -R www-data:www-data backend/storage backend/bootstrap/cache
chmod -R 775 backend/storage backend/bootstrap/cache
```

### 4.2 Pastikan Docker Terinstall

```bash
docker --version
docker compose version
```

Jika belum, install Docker:

```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
newgrp docker
sudo apt install docker-compose-plugin -y
```

### 4.3 Jalankan Container

```bash
docker compose up -d --build
```

Tunggu hingga semua image selesai di-build.

### 4.4 Generate APP_KEY & Setup Database

```bash
# Generate Laravel APP_KEY
docker exec sertifikat_app php artisan key:generate

# Jalankan migrasi + seeder
docker exec sertifikat_app php artisan migrate --seed --force

# Link storage publik
docker exec sertifikat_app php artisan storage:link

# Cache konfigurasi untuk production
docker exec sertifikat_app php artisan config:cache
docker exec sertifikat_app php artisan route:cache
docker exec sertifikat_app php artisan view:cache
```

---

## Tahap 5 — Verifikasi

### 5.1 Cek Status Container

```bash
docker compose ps
```

Semua container harus berstatus `Up`:

| Container             | Port | Keterangan       |
| --------------------- | ---- | ---------------- |
| `sertifikat_nginx`    | 8000 | Backend API      |
| `sertifikat_frontend` | 3000 | Frontend Next.js |
| `sertifikat_db`       | 3306 | MySQL            |
| `sertifikat_redis`    | 6379 | Redis            |
| `sertifikat_queue`    | —    | Queue Worker     |

### 5.2 Cek di Browser

- **Frontend:** `http://<IP_VPS>:3000`
- **Backend API:** `http://<IP_VPS>:8000/api`

---

## Tahap 6 — Update Aplikasi (Deployment Ulang)

### 6.1 Upload File Baru via FileZilla

1. Build ulang lokal jika ada perubahan:
   - Frontend: `npm run build`
   - Backend: `composer install --no-dev`
2. Upload file yang berubah via FileZilla ke path yang sama di VPS
3. Untuk perubahan env atau docker-compose, upload file tersebut

### 6.2 Restart Container via SSH

```bash
cd /var/www/sertifikat-app

# Jika hanya kode yang berubah (tanpa perubahan Dockerfile)
docker compose restart

# Jika ada perubahan Dockerfile atau docker-compose.yml
docker compose up -d --build

# Jika ada migrasi database baru
docker exec sertifikat_app php artisan migrate --force

# Refresh cache
docker exec sertifikat_app php artisan config:cache
docker exec sertifikat_app php artisan route:cache
```

---

## Troubleshooting

### Container tidak mau jalan

```bash
docker compose logs app
docker compose logs frontend
docker compose logs db
```

### Permission error di storage

```bash
docker exec sertifikat_app chmod -R 775 storage bootstrap/cache
docker exec sertifikat_app chown -R www-data:www-data storage bootstrap/cache
```

### Database migration gagal

```bash
# Cek koneksi ke database
docker exec sertifikat_app php artisan db:monitor

# Reset dan jalankan ulang (HATI-HATI: menghapus data)
docker exec sertifikat_app php artisan migrate:fresh --seed --force
```

### Port sudah dipakai

```bash
# Cek port yang sedang digunakan
ss -tulpn | grep -E '3000|8000'
```

---

## Catatan Penting

- Jangan upload folder `node_modules/` — sangat besar dan tidak diperlukan karena sudah ada di dalam Docker image
- File `.env` **wajib** diupload karena tidak masuk ke Git
- Folder `backend/vendor/` perlu diupload jika VPS tidak punya Composer
- Jika koneksi FileZilla putus saat upload, gunakan fitur **Transfer → Resume** untuk melanjutkan
