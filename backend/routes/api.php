<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\NilaiController;
use App\Http\Controllers\SertifikatController;
use App\Http\Controllers\SiswaController;
use App\Http\Controllers\UkkController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

// Auth
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me',      [AuthController::class, 'me']);

    // ── Super admin only ────────────────────────────────────────────────────
    Route::middleware('role:super_admin')->group(function () {
        // Manajemen user
        Route::apiResource('users', UserController::class);

        // Siswa & UKK
        Route::apiResource('siswa', SiswaController::class);
        Route::apiResource('ukk', UkkController::class);

        // Nilai — hapus hanya super_admin
        Route::delete('nilai/{nilai}', [NilaiController::class, 'destroy']);

        // Sertifikat
        Route::post('sertifikat/generate', [SertifikatController::class, 'generate']);
        Route::delete('sertifikat/{id}',   [SertifikatController::class, 'destroy']);
    });

    // ── Super admin + penguji ───────────────────────────────────────────────
    Route::middleware('role:super_admin,penguji_internal,penguji_external')->group(function () {
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
