<?php

namespace App\Console\Commands;

use App\Models\Sekolah;
use App\Services\DigitalSignatureService;
use Illuminate\Console\Command;

class GenerateSignatureKeys extends Command
{
    protected $signature = 'signature:generate-keys
                            {sekolah_id : ID sekolah yang akan dibuat key-nya}
                            {--force : Paksa buat ulang meskipun key sudah ada}';

    protected $description = 'Generate RSA-2048 key pair untuk tanda tangan digital sertifikat sekolah.';

    public function handle(DigitalSignatureService $sigService): int
    {
        $sekolahId = $this->argument('sekolah_id');
        $sekolah   = Sekolah::find($sekolahId);

        if (! $sekolah) {
            $this->error("Sekolah dengan ID {$sekolahId} tidak ditemukan.");
            return self::FAILURE;
        }

        $hasKey = $sigService->hasPrivateKey($sekolah);

        if ($hasKey && ! $this->option('force')) {
            $this->warn("Sekolah \"{$sekolah->nama}\" sudah memiliki key.");
            $this->line('Gunakan --force untuk membuat ulang (key lama akan DIGANTI dan sertifikat lama tidak bisa diverifikasi ulang).');
            return self::SUCCESS;
        }

        if ($hasKey && $this->option('force')) {
            if (! $this->confirm("⚠️  Key lama akan dihapus. Sertifikat yang sudah ditandatangani tidak dapat diverifikasi dengan key baru. Lanjutkan?")) {
                $this->info('Dibatalkan.');
                return self::SUCCESS;
            }
        }

        $this->info("Membuat RSA-2048 key pair untuk sekolah \"{$sekolah->nama}\" (ID: {$sekolah->id})...");

        try {
            $sigService->generateKeys($sekolah);
            $this->info('✅  Key pair berhasil dibuat.');
            $this->line("Private key : storage/app/signature_keys/{$sekolah->id}/private.key");
            $this->line('Public key  : disimpan di kolom sekolah.public_key');
            $this->newLine();
            $this->warn('⚠️  Simpan private key dengan aman. Jangan commit ke version control!');
        } catch (\Throwable $e) {
            $this->error('Gagal membuat key: ' . $e->getMessage());
            return self::FAILURE;
        }

        return self::SUCCESS;
    }
}
