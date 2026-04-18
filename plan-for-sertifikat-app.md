# Plan: Aplikasi Cetak Sertifikat UKK

## Context

Aplikasi ini dibangun untuk memfasilitasi proses input nilai UKK (Uji Kompetensi Keahlian) siswa SMK, penghitungan nilai akhir, serta generate dan cetak sertifikat secara otomatis. Sistem menggunakan arsitektur **Client–Server (Headless API)** dengan **Laravel 13** sebagai backend dan **Next.js 16** sebagai frontend.

---

## Arsitektur Sistem

```
Next.js 16 (Frontend)
        |
        | HTTP REST API
        v
Laravel 13 API (Backend)
        |
        | Eloquent ORM
        v
MySQL / PostgreSQL
```

Pola arsitektur backend: **Controller → Service → Repository → Model**

---

## Tech Stack

| Layer      | Teknologi                                               |
|------------|--------------------------------------------------------|
| Frontend   | Next.js 16 (App Router), Tailwind CSS, ShadCN UI       |
| State      | Zustand                                                |
| Form       | React Hook Form + Zod                                  |
| Data Fetch | TanStack Query (React Query)                           |
| Backend    | Laravel 13                                             |
| Auth       | Laravel Sanctum (SPA)                                  |
| PDF        | barryvdh/laravel-dompdf                                |
| Queue      | Redis + Laravel Queue                                  |
| Database   | MySQL                                                  |
| Storage    | Local (dev) / AWS S3 (prod)                            |
| DevOps     | Docker, Nginx, GitHub Actions                          |

---

## Struktur Database

### Tabel Utama

```sql
users             -- admin, guru
siswa             -- data peserta UKK
ukk               -- data ujian (tahun, jurusan, dll)
nilai             -- nilai per siswa per UKK
template_sertifikat -- HTML template sertifikat
sertifikat        -- record sertifikat yang sudah digenerate
```

### Relasi
- `siswa` → banyak `nilai`
- `ukk` → banyak `nilai`
- `nilai` → satu `sertifikat`
- `template_sertifikat` → banyak `sertifikat`

---

## Struktur Proyek

### Backend (Laravel 13)

```
app/
├── Http/
│   ├── Controllers/
│   │   ├── AuthController.php
│   │   ├── SiswaController.php
│   │   ├── NilaiController.php
│   │   └── SertifikatController.php
│   ├── Requests/
│   └── Middleware/
├── Services/
│   ├── NilaiService.php          # hitung nilai akhir & predikat
│   └── CertificateService.php   # inject data ke template, generate PDF
├── Repositories/
│   ├── SiswaRepository.php
│   ├── NilaiRepository.php
│   └── SertifikatRepository.php
├── Models/
│   ├── User.php
│   ├── Siswa.php
│   ├── Ukk.php
│   ├── Nilai.php
│   ├── Sertifikat.php
│   └── TemplateSertifikat.php
├── Jobs/
│   └── GenerateCertificateJob.php
├── Events/
│   └── NilaiFinalized.php
└── Listeners/
    └── GenerateCertificateListener.php

routes/
└── api.php

resources/
└── views/
    └── certificate/
        └── template.blade.php   # HTML template untuk PDF
```

### Frontend (Next.js 16)

```
app/
├── (auth)/
│   └── login/
│       └── page.tsx
├── dashboard/
│   └── page.tsx
├── siswa/
│   ├── page.tsx            # daftar siswa
│   └── [id]/page.tsx
├── nilai/
│   ├── page.tsx            # input nilai
│   └── [id]/page.tsx
└── sertifikat/
    ├── page.tsx            # daftar sertifikat
    └── [id]/
        ├── page.tsx        # preview sertifikat
        └── print/page.tsx  # halaman cetak

components/
├── ui/                     # ShadCN components
├── forms/
│   ├── SiswaForm.tsx
│   └── NilaiForm.tsx
├── certificate/
│   ├── CertificatePreview.tsx
│   └── CertificateCard.tsx
└── layout/
    ├── Sidebar.tsx
    └── Header.tsx

lib/
├── api.ts                  # axios instance
├── hooks/
│   ├── useSiswa.ts
│   ├── useNilai.ts
│   └── useSertifikat.ts
└── validations/
    ├── siswaSchema.ts
    └── nilaiSchema.ts

services/
└── api/
    ├── siswaService.ts
    ├── nilaiService.ts
    └── sertifikatService.ts
```

---

## Alur Sistem (Flow)

```
1. Admin login
2. Admin input data siswa
3. Guru input nilai UKK per siswa
4. Sistem hitung nilai akhir otomatis
   - Nilai akhir = rata-rata nilai komponen
   - Status: Lulus (≥ 75) / Tidak Lulus
   - Predikat: A/B/C/D
5. Admin klik "Generate Sertifikat"
6. Backend:
   a. Ambil template HTML
   b. Inject data (nama, nilai, predikat, tanda tangan)
   c. Kirim ke queue (GenerateCertificateJob)
   d. Worker generate PDF via DomPDF
   e. Simpan file PDF ke storage
   f. Update record sertifikat
7. Frontend tampilkan preview sertifikat
8. User download PDF / cetak langsung
```

---

## API Endpoints

### Auth
| Method | Endpoint       | Deskripsi         |
|--------|---------------|-------------------|
| POST   | /api/login    | Login user        |
| POST   | /api/logout   | Logout user       |

### Siswa
| Method | Endpoint          | Deskripsi          |
|--------|------------------|--------------------|
| GET    | /api/siswa       | Daftar siswa       |
| POST   | /api/siswa       | Tambah siswa       |
| GET    | /api/siswa/{id}  | Detail siswa       |
| PUT    | /api/siswa/{id}  | Update siswa       |
| DELETE | /api/siswa/{id}  | Hapus siswa        |

### Nilai
| Method | Endpoint         | Deskripsi          |
|--------|-----------------|---------------------|
| GET    | /api/nilai       | Daftar nilai        |
| POST   | /api/nilai       | Input nilai         |
| PUT    | /api/nilai/{id}  | Update nilai        |

### Sertifikat
| Method | Endpoint                      | Deskripsi               |
|--------|------------------------------|-------------------------|
| POST   | /api/sertifikat/generate     | Trigger generate PDF    |
| GET    | /api/sertifikat/{id}         | Detail sertifikat       |
| GET    | /api/sertifikat/{id}/download| Download PDF            |

---

## Fitur Utama (per Sprint)

### Sprint 1 — Setup & Auth ✅
- [x] Setup Laravel 13 + Sanctum
- [x] Setup Next.js 16 + Tailwind + ShadCN
- [x] Setup Docker (Laravel + Next.js + MySQL + Redis)
- [x] Halaman login (frontend)
- [x] Auth middleware (backend)

### Sprint 2 — Manajemen Data ✅
- [x] CRUD Siswa (backend + frontend)
- [x] CRUD UKK/ujian
- [x] Input nilai siswa (form)
- [x] Validasi form (Zod + Laravel Form Request)

### Sprint 3 — Generate Sertifikat ✅
- [x] Template sertifikat (Blade HTML + CSS)
- [x] CertificateService: inject data ke template
- [x] GenerateCertificateJob: generate PDF via DomPDF
- [x] Queue worker setup (database driver)
- [x] Storage file PDF

### Sprint 4 — Frontend Sertifikat ✅
- [x] Preview sertifikat di browser (HTML render)
- [x] Download tombol PDF
- [x] Halaman cetak (print-friendly layout)
- [x] Status polling (queue selesai → tampilkan download)

### Sprint 5 — Fitur Tambahan (Opsional)
- [ ] QR Code verifikasi sertifikat
- [ ] Import nilai dari Excel
- [ ] Role management (Admin / Guru)
- [ ] Audit log

---

## Perhitungan Nilai

```php
// NilaiService.php
public function hitungNilaiAkhir(array $komponenNilai): array
{
    $nilaiAkhir = array_sum($komponenNilai) / count($komponenNilai);
    $lulus = $nilaiAkhir >= 75;

    $predikat = match(true) {
        $nilaiAkhir >= 90 => 'A',
        $nilaiAkhir >= 80 => 'B',
        $nilaiAkhir >= 75 => 'C',
        default           => 'D',
    };

    return [
        'nilai_akhir' => round($nilaiAkhir, 2),
        'status'      => $lulus ? 'Lulus' : 'Tidak Lulus',
        'predikat'    => $predikat,
    ];
}
```

---

## Template Sertifikat (Blade HTML)

```html
<!-- resources/views/certificate/template.blade.php -->
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Times New Roman', serif; }
    .certificate {
      width: 297mm; height: 210mm; /* A4 Landscape */
      position: relative;
      padding: 30mm 25mm;
    }
    .nama { font-size: 28pt; font-weight: bold; }
    .nilai { font-size: 18pt; }
    /* ... */
  </style>
</head>
<body>
  <div class="certificate">
    <h1>SERTIFIKAT UKK</h1>
    <p>Diberikan kepada:</p>
    <p class="nama">{{ $nama }}</p>
    <p>Nilai Akhir: <span class="nilai">{{ $nilai_akhir }}</span></p>
    <p>Predikat: {{ $predikat }}</p>
    <p>Status: {{ $status }}</p>
    <img src="{{ $qr_code }}" />
    <img src="{{ $tanda_tangan }}" />
  </div>
</body>
</html>
```

---

## Docker Setup

```yaml
# docker-compose.yml
services:
  app:        # Laravel
  frontend:   # Next.js
  nginx:      # Reverse proxy
  db:         # MySQL
  redis:      # Queue
  queue:      # Laravel worker
```

---

## Verifikasi & Testing

### Backend
```bash
php artisan test                    # unit & feature tests
php artisan queue:work              # test queue processing
```

### Frontend
```bash
npm run dev                         # dev server
npm run build && npm run start      # production test
```

### End-to-End
1. Login sebagai admin
2. Tambah data siswa
3. Input nilai UKK
4. Klik "Generate Sertifikat"
5. Tunggu queue selesai
6. Preview sertifikat di browser
7. Download PDF, verifikasi layout A4 landscape
8. (Opsional) Scan QR Code untuk verifikasi

---

## File Kritis

| File | Keterangan |
|------|------------|
| `app/Services/CertificateService.php` | Core logic generate sertifikat |
| `app/Services/NilaiService.php` | Hitung nilai & predikat |
| `app/Jobs/GenerateCertificateJob.php` | Queue job PDF generation |
| `resources/views/certificate/template.blade.php` | Template HTML sertifikat |
| `routes/api.php` | Semua API endpoint |
| `app/(frontend)/sertifikat/[id]/page.tsx` | Preview & download UI |
| `lib/hooks/useSertifikat.ts` | TanStack Query hooks |
