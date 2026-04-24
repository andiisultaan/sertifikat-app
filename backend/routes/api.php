<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\CertificateVerifyController;
use App\Http\Controllers\NilaiController;
use App\Http\Controllers\SekolahController;
use App\Http\Controllers\SertifikatController;
use App\Http\Controllers\SiswaController;
use App\Http\Controllers\UkkController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

Route::get('/verify/{token}', [CertificateVerifyController::class, 'verify']);

Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/change-password', [AuthController::class, 'changePassword']);

    Route::middleware('role:super_admin')->group(function () {
        Route::apiResource('users', UserController::class);
        Route::post('sekolah', [SekolahController::class, 'store']);
        Route::delete('sekolah/{sekolah}', [SekolahController::class, 'destroy']);
    });

    Route::middleware(['role:super_admin,admin', 'scope.sekolah'])->group(function () {
        Route::get('sekolah', [SekolahController::class, 'index']);
        Route::get('sekolah/{sekolah}', [SekolahController::class, 'show']);
        Route::put('sekolah/{sekolah}', [SekolahController::class, 'update']);
        Route::patch('sekolah/{sekolah}', [SekolahController::class, 'update']);

        Route::apiResource('siswa', SiswaController::class)->except(['index', 'show']);
        Route::apiResource('ukk', UkkController::class)->except(['index', 'show']);

        Route::delete('nilai/{nilai}', [NilaiController::class, 'destroy']);

        Route::post('sertifikat/generate', [SertifikatController::class, 'generate']);
        Route::delete('sertifikat/{id}', [SertifikatController::class, 'destroy']);
    });

    Route::middleware(['role:super_admin,admin,penguji_internal,penguji_external', 'scope.sekolah'])->group(function () {
        Route::get('nilai', [NilaiController::class, 'index']);
        Route::post('nilai', [NilaiController::class, 'store']);
        Route::get('nilai/{nilai}', [NilaiController::class, 'show']);
        Route::put('nilai/{nilai}', [NilaiController::class, 'update']);

        Route::get('siswa', [SiswaController::class, 'index']);
        Route::get('siswa/{siswa}', [SiswaController::class, 'show']);
        Route::get('ukk', [UkkController::class, 'index']);
        Route::get('ukk/{ukk}', [UkkController::class, 'show']);

        Route::get('sertifikat', [SertifikatController::class, 'index']);
        Route::get('sertifikat/{id}', [SertifikatController::class, 'show']);
        Route::get('sertifikat/{id}/download', [SertifikatController::class, 'download']);
    });
});
