<?php

namespace App\Services;

use App\Models\Sekolah;
use App\Models\Sertifikat;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class DigitalSignatureService
{
    /**
     * Directory (in storage/app) where private keys are kept.
     * NOT publicly accessible.
     */
    private string $keyDir = 'signature_keys';

    // ── Key Management ──────────────────────────────────────────────────────

    /**
     * Generate RSA-2048 key pair for a school.
     * Private key  → storage/app/signature_keys/{sekolah_id}/private.key
     * Public key   → stored in sekolah.public_key column (PEM text)
     *
     * @throws \RuntimeException
     */
    /**
     * Resolve the private key file path for a given role.
     * kepsek           → {id}/private.key
     * penguji_eksternal → {id}/penguji_eksternal.key
     */
    private function privateKeyPath(Sekolah $sekolah, string $role): string
    {
        $filename = $role === 'penguji_eksternal' ? 'penguji_eksternal.key' : 'private.key';
        return "{$this->keyDir}/{$sekolah->id}/{$filename}";
    }

    /**
     * Resolve the public key DB column for a given role.
     */
    private function publicKeyColumn(string $role): string
    {
        return $role === 'penguji_eksternal' ? 'public_key_penguji_eksternal' : 'public_key';
    }

    public function generateKeys(Sekolah $sekolah, string $role = 'kepsek'): void
    {
        // On Windows, openssl_pkey_new() may fail if OPENSSL_CONF is not set.
        $opensslConfig = [];
        if (PHP_OS_FAMILY === 'Windows') {
            $envConf = getenv('OPENSSL_CONF');
            if ($envConf && file_exists($envConf)) {
                $opensslConfig['config'] = $envConf;
            } else {
                // Fallback to bundled minimal config in storage
                $bundled = storage_path('app/openssl.cnf');
                if (file_exists($bundled)) {
                    $opensslConfig['config'] = $bundled;
                }
            }
        }

        $privateKeyRes = openssl_pkey_new(array_merge([
            'private_key_bits' => 2048,
            'private_key_type' => OPENSSL_KEYTYPE_RSA,
        ], $opensslConfig));

        if ($privateKeyRes === false) {
            $errors = [];
            while ($msg = openssl_error_string()) {
                $errors[] = $msg;
            }
            throw new \RuntimeException('Gagal membuat RSA key pair: ' . implode(' | ', $errors ?: ['unknown error']));
        }

        // Export private key PEM
        $privateKeyPem = '';
        $exported = openssl_pkey_export($privateKeyRes, $privateKeyPem, null, $opensslConfig ?: []);

        if (! $exported || empty($privateKeyPem)) {
            $errors = [];
            while ($msg = openssl_error_string()) {
                $errors[] = $msg;
            }
            throw new \RuntimeException('Gagal export private key: ' . implode(' | ', $errors ?: ['unknown error']));
        }

        // Export public key PEM
        $details      = openssl_pkey_get_details($privateKeyRes);
        $publicKeyPem = $details['key'];

        // Store private key to (non-public) storage
        Storage::disk('local')->put($this->privateKeyPath($sekolah, $role), $privateKeyPem);

        // Store public key in DB
        $sekolah->update([$this->publicKeyColumn($role) => $publicKeyPem]);
    }

    /**
     * Check whether a school has a private key file.
     */
    public function hasPrivateKey(Sekolah $sekolah, string $role = 'kepsek'): bool
    {
        return Storage::disk('local')->exists($this->privateKeyPath($sekolah, $role));
    }

    /**
     * Read the private key for a school (PEM string).
     */
    public function getPrivateKey(Sekolah $sekolah, string $role = 'kepsek'): string
    {
        $path = $this->privateKeyPath($sekolah, $role);

        if (! Storage::disk('local')->exists($path)) {
            throw new \RuntimeException("Private key ({$role}) tidak ditemukan untuk sekolah #{$sekolah->id}.");
        }

        return Storage::disk('local')->get($path);
    }

    // ── Signing ─────────────────────────────────────────────────────────────

    /**
     * Build the canonical payload string that will be signed.
     * Format: {nomor}|{nama}|{nis}|{jurusan}|{nilai_akhir}|{predikat}|{tanggal_terbit}
     */
    public function buildPayload(Sertifikat $sertifikat): string
    {
        $nilai  = $sertifikat->nilai;
        $siswa  = $nilai->siswa;
        $tanggal = $sertifikat->generated_at
            ? $sertifikat->generated_at->format('Y-m-d')
            : now()->format('Y-m-d');

        return implode('|', [
            $sertifikat->nomor_sertifikat,
            $siswa->nama,
            $siswa->nis,
            $siswa->jurusan,
            $nilai->nilai_akhir,
            $nilai->predikat,
            $tanggal,
        ]);
    }

    /**
     * Sign the sertifikat and persist {signature_payload, digital_signature, is_signed}.
     * Requires the school's private key to be present on disk.
     *
     * @throws \RuntimeException
     */
    public function sign(Sertifikat $sertifikat): void
    {
        $sertifikat->loadMissing(['nilai.siswa', 'nilai.ukk.sekolah']);
        $sekolah = $sertifikat->nilai?->ukk?->sekolah;

        if (! $sekolah) {
            // If school not found, skip signing silently (backwards compat)
            return;
        }

        if (! $this->hasPrivateKey($sekolah)) {
            // No key generated yet — skip signing but don't crash PDF generation
            return;
        }

        try {
            $privateKeyPem = $this->getPrivateKey($sekolah);
            $privateKey    = openssl_pkey_get_private($privateKeyPem);

            if ($privateKey === false) {
                throw new \RuntimeException('Private key tidak valid: ' . openssl_error_string());
            }

            $payload   = $this->buildPayload($sertifikat);
            $signature = '';
            $success   = openssl_sign($payload, $signature, $privateKey, OPENSSL_ALGO_SHA256);

            if (! $success) {
                throw new \RuntimeException('openssl_sign gagal: ' . openssl_error_string());
            }

            $sertifikat->update([
                'signature_payload' => $payload,
                'digital_signature' => base64_encode($signature),
                'is_signed'         => true,
            ]);
        } catch (\Throwable $e) {
            // Log but don't bubble — signature failure must not block PDF delivery
            Log::warning("DigitalSignatureService::sign gagal untuk sertifikat #{$sertifikat->id}: " . $e->getMessage());
        }
    }

    // ── Verification ────────────────────────────────────────────────────────

    /**
     * Verify the stored digital signature against the public key.
     *
     * Returns:
     *   1  = valid
     *   0  = invalid (tampered)
     *  -1  = error (key problem)
     *  null = no signature stored yet
     */
    public function verify(Sertifikat $sertifikat): ?int
    {
        return $this->verifyByRole($sertifikat, 'kepsek');
    }

    /**
     * Verify the digital signature for a specific signer role.
     */
    public function verifyByRole(Sertifikat $sertifikat, string $role): ?int
    {
        $isSigned  = $role === 'penguji_eksternal' ? $sertifikat->is_signed_penguji : $sertifikat->is_signed;
        $sigStored = $role === 'penguji_eksternal' ? $sertifikat->digital_signature_penguji : $sertifikat->digital_signature;

        if (! $isSigned || empty($sigStored)) {
            return null;
        }

        $sertifikat->loadMissing(['nilai.ukk.sekolah']);
        $sekolah = $sertifikat->nilai?->ukk?->sekolah;

        $pubKeyColumn = $this->publicKeyColumn($role);
        if (! $sekolah || empty($sekolah->{$pubKeyColumn})) {
            return -1;
        }

        $publicKey = openssl_pkey_get_public($sekolah->{$pubKeyColumn});
        if ($publicKey === false) {
            return -1;
        }

        $payload   = $sertifikat->signature_payload ?? $this->buildPayload($sertifikat);
        $signature = base64_decode($sigStored);

        return openssl_verify($payload, $signature, $publicKey, OPENSSL_ALGO_SHA256);
    }

    /**
     * Return a short fingerprint of the signature for display in the PDF.
     * Format: SHA-256 of the base64 signature, first 32 hex chars.
     */
    public function fingerprint(Sertifikat $sertifikat): ?string
    {
        if (empty($sertifikat->digital_signature)) {
            return null;
        }

        return strtoupper(substr(hash('sha256', $sertifikat->digital_signature), 0, 32));
    }
}
