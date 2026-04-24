# Sertifikat UKK App

Aplikasi manajemen proses Uji Kompetensi Keahlian (UKK), mulai dari data siswa, data UKK, input nilai, sampai generate dan verifikasi sertifikat digital.

## Fitur Utama

- Login berbasis token (`Laravel Sanctum`)
- Manajemen data:
  - User
  - Sekolah
  - Siswa
  - UKK
  - Nilai
- Generate sertifikat PDF untuk siswa dengan status **Lulus**
- Download sertifikat PDF
- Verifikasi keaslian sertifikat lewat token QR (`/verify/{token}`)
- Cek nilai siswa tanpa login lewat halaman publik (`/cek-nilai`)
- Role-based access:
  - `super_admin`
  - `admin`
  - `penguji_internal`
  - `penguji_external`

## Tech Stack

- Frontend: Next.js 16, React 19, TypeScript, React Query, Zustand
- Backend: Laravel 13, PHP 8.3, Sanctum, DomPDF, Simple QrCode
- Database: MySQL 8
- Cache/Queue: Redis 7
- Reverse proxy: Nginx
- Orchestration: Docker Compose

## Struktur Proyek

```text
sertifikat-app/
|- frontend/    # Next.js app
|- backend/     # Laravel API + PDF generation
|- docker/      # Konfigurasi Nginx
|- docker-compose.yml
```

## Jalankan Dengan Docker (Disarankan)

### 1) Prasyarat

- Docker + Docker Compose

### 2) Build dan start container

```bash
docker compose up -d --build
```

Service utama dari `docker-compose.yml`:

- App URL: `http://localhost:8080`
- Backend API (via Nginx): `http://localhost:8080/api`
- MySQL host port: `3307`
- Redis host port: `6379`

### 3) Inisialisasi Laravel

```bash
docker compose exec app cp -n .env.example .env
docker compose exec app php artisan key:generate
docker compose exec app php artisan migrate --seed
```

### 4) Storage link (untuk file PDF)

```bash
docker compose exec app php artisan storage:link
```

### 5) Cek worker queue

Container `queue` sudah disiapkan dan menjalankan:

```bash
php artisan queue:work --sleep=3 --tries=3 --timeout=90
```

## Jalankan Tanpa Docker (Opsional)

Jika ingin development lokal per service.

### Backend (Laravel)

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan storage:link
php artisan serve
```

### Frontend (Next.js)

```bash
cd frontend
npm install
npm run dev
```

Buat file `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_INTERNAL_API_URL=http://localhost:8000/api
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=replace_with_secure_secret
```

## Akun Seed Default

Data akun awal dibuat oleh `DatabaseSeeder`:

- Super Admin  
  Email: `admin@sekolah.sch.id`  
  Password: `password`
- Penguji Internal  
  Email: `internal@sekolah.sch.id`  
  Password: `password`
- Penguji External  
  Email: `external@sekolah.sch.id`  
  Password: `password`

Catatan: segera ganti password default setelah login pertama.

## Endpoint API Inti

Public:

- `POST /api/login`
- `GET /api/verify/{token}`
- `GET /api/public/sekolah`
- `GET /api/public/nilai?sekolah_id={id}&nis={nis}&nama={nama}`

Authenticated:

- `POST /api/logout`
- `GET /api/me`
- `POST /api/change-password`
- CRUD data: `users`, `sekolah`, `siswa`, `ukk`, `nilai`
- Sertifikat:
  - `POST /api/sertifikat/generate`
  - `GET /api/sertifikat`
  - `GET /api/sertifikat/{id}`
  - `GET /api/sertifikat/{id}/download`
  - `DELETE /api/sertifikat/{id}`

## Verifikasi Sertifikat

Halaman verifikasi tersedia di frontend:

- `GET /verify/{token}`

Halaman ini memanggil API:

- `GET /api/verify/{token}`

## Cek Nilai Publik

Halaman cek nilai tersedia di frontend:

- `GET /cek-nilai`

Halaman ini memanggil API:

- `GET /api/public/sekolah` (daftar sekolah)
- `GET /api/public/nilai` (wajib `sekolah_id`, lalu isi minimal `nis` atau `nama`)

## Catatan Penting

- Generate sertifikat hanya bisa dilakukan jika nilai siswa sudah lengkap dan status nilai **Lulus**.
- Sertifikat menggunakan template default dari seeder `TemplateSertifikatSeeder`.
- Untuk produksi, ubah seluruh secret dan kredensial default (`DB`, `NEXTAUTH_SECRET`, akun user awal).

## Perintah Berguna

```bash
# Lihat log semua service
docker compose logs -f

# Hentikan semua container
docker compose down

# Hentikan + hapus volume (reset database)
docker compose down -v
```
