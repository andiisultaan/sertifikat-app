<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\CertificateVerifyController;
use App\Http\Controllers\NilaiController;
use App\Http\Controllers\SertifikatController;
use App\Http\Controllers\SiswaController;
use App\Http\Controllers\UkkController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

// ── Verifikasi sertifikat (publik, tanpa auth) ──────────────────────────────
Route::get('/verify/{token}', [CertificateVerifyController::class, 'verify']);

// Auth
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me',      [AuthController::class, 'me']);
    Route::post('/change-password', [AuthController::class, 'changePassword']);

    // ── Super admin only — manajemen user ──────────────────────────────────
    Route::middleware('role:super_admin')->group(function () {
        Route::apiResource('users', UserController::class);
    });

    // ── Super admin + admin ────────────────────────────────────────────────
    Route::middleware('role:super_admin,admin')->group(function () {
        // Siswa & UKK
        Route::apiResource('siswa', SiswaController::class);
        Route::apiResource('ukk', UkkController::class);

        // Nilai — hapus
        Route::delete('nilai/{nilai}', [NilaiController::class, 'destroy']);

        // Sertifikat — generate & delete
        Route::post('sertifikat/generate', [SertifikatController::class, 'generate']);
        Route::delete('sertifikat/{id}',   [SertifikatController::class, 'destroy']);
    });

    // ── Semua role terautentikasi ──────────────────────────────────────────
    Route::middleware('role:super_admin,admin,penguji_internal,penguji_external')->group(function () {
        // Nilai — read, create, update
        Route::get('nilai',             [NilaiController::class, 'index']);
        Route::post('nilai',            [NilaiController::class, 'store']);
        Route::get('nilai/{nilai}',     [NilaiController::class, 'show']);
        Route::put('nilai/{nilai}',     [NilaiController::class, 'update']);

        // Siswa & UKK — read only (untuk dropdown form nilai)
        Route::get('siswa',             [SiswaController::class, 'index']);
        Route::get('siswa/{siswa}',     [SiswaController::class, 'show']);
        Route::get('ukk',               [UkkController::class, 'index']);
        Route::get('ukk/{ukk}',         [UkkController::class, 'show']);

        // Sertifikat — read only
        Route::get('sertifikat',             [SertifikatController::class, 'index']);
        Route::get('sertifikat/{id}',        [SertifikatController::class, 'show']);
        Route::get('sertifikat/{id}/download',[SertifikatController::class, 'download']);
    });
});
