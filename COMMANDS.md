# Panduan Command — Sertifikat App

## Struktur Proyek

```
sertifikat-app/
├── backend/    → Laravel 12 (REST API)
└── frontend/   → Next.js 16 (UI)
```

---

## Backend (Laravel)

### Setup Awal

```bash
cd backend

# 1. Install dependencies
composer install

# 2. Salin file environment
cp .env.example .env

# 3. Generate app key
php artisan key:generate

# 4. Jalankan migrasi database
php artisan migrate

# 5. Jalankan seeder (template sertifikat default)
php artisan db:seed

# 6. Buat symlink storage agar file PDF bisa diakses publik
php artisan storage:link
```

### Menjalankan Server

```bash
# Development server (default: http://localhost:8000)
php artisan serve

# Dengan port custom
php artisan serve --port=8080
```

---

## Queue Sertifikat

Generate sertifikat berjalan secara **asynchronous** via Laravel Queue (`QUEUE_CONNECTION=database`).  
Queue **wajib dijalankan** agar PDF sertifikat bisa diproduksi setelah tombol "Generate" diklik.

### Menjalankan Queue Worker

```bash
# Jalankan worker (proses terus berjalan di background)
php artisan queue:work

# Dengan opsi tambahan (direkomendasikan untuk development)
php artisan queue:work --tries=3 --timeout=120 --sleep=3
```

> **Catatan:** Biarkan terminal ini tetap terbuka. Setiap kali generate sertifikat diklik di UI, worker ini yang akan memprosesnya dan mengubah status dari `pending` → `processing` → `selesai`.

### Memantau Queue

```bash
# Lihat semua job yang sedang antre (belum diproses)
php artisan tinker
>>> DB::table('jobs')->get();

# Lihat job yang gagal
php artisan queue:failed

# Coba ulang semua job yang gagal
php artisan queue:retry all

# Coba ulang job tertentu berdasarkan ID
php artisan queue:retry 5

# Hapus semua job yang gagal
php artisan queue:flush

# Lihat status sertifikat langsung dari DB
>>> App\Models\Sertifikat::select('id','nomor_sertifikat','status','error_message')->get();
```

### Alur Status Sertifikat

```
[Klik Generate]
      ↓
  pending        → job masuk ke tabel jobs
      ↓  (queue:work berjalan)
  processing     → PDF sedang dibuat
      ↓
  selesai        → PDF tersimpan di storage/app/public/sertifikat/
      
  gagal          → lihat kolom error_message di tabel sertifikat
```

### Reset Queue yang Macet

```bash
# Restart worker setelah deploy / perubahan kode
php artisan queue:restart

# Hapus semua job pending yang belum diproses
php artisan tinker
>>> DB::table('jobs')->truncate();
```

---

## Frontend (Next.js)

### Setup Awal

```bash
cd frontend

# Install dependencies
npm install

# Salin file environment
cp .env.example .env.local
# Isi NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Menjalankan Development Server

```bash
# Development (default: http://localhost:3000)
npm run dev

# Build production
npm run build

# Jalankan hasil build
npm run start
```

---

## Menjalankan Keduanya Sekaligus

Buka **3 terminal** secara bersamaan:

| Terminal | Direktori  | Command                  | Keterangan              |
|----------|-----------|--------------------------|-------------------------|
| 1        | `backend`  | `php artisan serve`      | API server              |
| 2        | `backend`  | `php artisan queue:work` | Worker generate PDF     |
| 3        | `frontend` | `npm run dev`            | UI Next.js              |

---

## Artisan Lain yang Berguna

```bash
# Reset & seed ulang database (HATI-HATI: hapus semua data)
php artisan migrate:fresh --seed

# Lihat semua route API
php artisan route:list --path=api

# Clear semua cache
php artisan optimize:clear

# Lihat log aplikasi (tail)
tail -f storage/logs/laravel.log
```
