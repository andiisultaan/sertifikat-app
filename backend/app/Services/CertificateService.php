<?php

namespace App\Services;

use App\Models\Sertifikat;
use App\Models\TemplateSertifikat;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use SimpleSoftwareIO\QrCode\Facades\QrCode;

class CertificateService
{
    public function __construct(
        private readonly DigitalSignatureService $sigService,
    ) {}

    /**
     * Generate PDF sertifikat dari record Sertifikat yang sudah ada.
     * Menyimpan file ke storage dan update status.
     */
    public function generate(Sertifikat $sertifikat): Sertifikat
    {
        $sertifikat->update(['status' => 'processing']);

        try {
            // Pastikan qr_token sudah ada — gunakan token deterministik
            if (empty($sertifikat->qr_token)) {
                $deterministicToken = substr(hash_hmac('sha256', 'sertifikat-kepsek-' . $sertifikat->nilai_id, config('app.key')), 0, 32);
                $sertifikat->update(['qr_token' => $deterministicToken]);
                $sertifikat->refresh();
            }

            // Token terpisah untuk penguji eksternal
            if (empty($sertifikat->qr_token_penguji)) {
                $tokenPenguji = substr(hash_hmac('sha256', 'sertifikat-penguji-' . $sertifikat->nilai_id, config('app.key')), 0, 32);
                $sertifikat->update(['qr_token_penguji' => $tokenPenguji]);
                $sertifikat->refresh();
            }

            $nilai  = $sertifikat->nilai()->with(['siswa', 'ukk.sekolah'])->firstOrFail();
            $siswa  = $nilai->siswa;
            $ukk    = $nilai->ukk;
            $sekolah = $ukk?->sekolah;

            if (!$siswa) {
                throw new \RuntimeException("Data siswa tidak ditemukan untuk nilai ID {$nilai->id}.");
            }
            if (!$ukk) {
                throw new \RuntimeException("Data UKK tidak ditemukan untuk nilai ID {$nilai->id}.");
            }

            // Generate QR code (kepsek) sebagai base64 SVG
            $verifyUrl = rtrim(config('app.frontend_url', config('app.url')), '/') . '/verify/' . $sertifikat->qr_token;
            $qrBase64  = base64_encode(
                QrCode::format('svg')
                    ->size(120)
                    ->margin(1)
                    ->generate($verifyUrl)
            );

            // Generate QR code (penguji eksternal) sebagai base64 SVG
            $verifyUrlPenguji = rtrim(config('app.frontend_url', config('app.url')), '/') . '/verify/' . $sertifikat->qr_token_penguji;
            $qrBase64Penguji  = base64_encode(
                QrCode::format('svg')
                    ->size(120)
                    ->margin(1)
                    ->generate($verifyUrlPenguji)
            );

            // ── Digital Signature ──────────────────────────────────────────
            // Sign BEFORE generating the PDF so the fingerprint can be embedded.
            // Signing is based on canonical data (not PDF bytes), so we set
            // generated_at = now() to match the payload built by sign().
            $tanggalTerbit = now();
            $sertifikat->generated_at = $tanggalTerbit; // temp in-memory, persisted below

            $signaturePayload           = null;
            $digitalSignatureKepsek     = null;
            $digitalSignaturePenguji    = null;
            $fingerprintKepsek          = null;
            $fingerprintPenguji         = null;
            $isSignedKepsek             = false;
            $isSignedPenguji            = false;

            // Canonical payload (sama untuk kedua penandatangan)
            if ($sekolah) {
                $signaturePayload = implode('|', [
                    $sertifikat->nomor_sertifikat,
                    $siswa->nama,
                    $siswa->nisn,
                    $siswa->jurusan,
                    $nilai->nilai_akhir,
                    $nilai->predikat,
                    $tanggalTerbit->format('Y-m-d'),
                ]);
            }

            // Tanda tangan Kepala Sekolah
            if ($sekolah && $this->sigService->hasPrivateKey($sekolah, 'kepsek')) {
                try {
                    $privateKeyPem = $this->sigService->getPrivateKey($sekolah, 'kepsek');
                    $privateKey    = openssl_pkey_get_private($privateKeyPem);
                    if ($privateKey !== false) {
                        $rawSig = '';
                        if (openssl_sign($signaturePayload, $rawSig, $privateKey, OPENSSL_ALGO_SHA256)) {
                            $digitalSignatureKepsek = base64_encode($rawSig);
                            $fingerprintKepsek      = strtoupper(substr(hash('sha256', $digitalSignatureKepsek), 0, 32));
                            $isSignedKepsek         = true;
                        }
                    }
                } catch (\Throwable $e) {
                    Log::warning("Tanda tangan kepsek gagal untuk sertifikat #{$sertifikat->id}: " . $e->getMessage());
                }
            }

            // Tanda tangan Penguji Eksternal
            if ($sekolah && $this->sigService->hasPrivateKey($sekolah, 'penguji_eksternal')) {
                try {
                    $privateKeyPem = $this->sigService->getPrivateKey($sekolah, 'penguji_eksternal');
                    $privateKey    = openssl_pkey_get_private($privateKeyPem);
                    if ($privateKey !== false) {
                        $rawSig = '';
                        if (openssl_sign($signaturePayload, $rawSig, $privateKey, OPENSSL_ALGO_SHA256)) {
                            $digitalSignaturePenguji = base64_encode($rawSig);
                            $fingerprintPenguji      = strtoupper(substr(hash('sha256', $digitalSignaturePenguji), 0, 32));
                            $isSignedPenguji         = true;
                        }
                    }
                } catch (\Throwable $e) {
                    Log::warning("Tanda tangan penguji gagal untuk sertifikat #{$sertifikat->id}: " . $e->getMessage());
                }
            }

            $isSigned = $isSignedKepsek || $isSignedPenguji;

            $data = [
                'nama'                   => $siswa->nama,
                'nisn'                   => $siswa->nisn,
                'jurusan'                => $ukk->jurusan ?: $siswa->jurusan,
                'tempat_lahir'           => $siswa->tempat_lahir,
                'nama_ukk'               => $ukk->nama,
                'judul_pengujian'        => $ukk->judul_pengujian,
                'tahun'                  => $ukk->tahun,
                'nilai_akhir'            => $nilai->nilai_akhir,
                'predikat'               => $nilai->predikat,
                'status'                 => $nilai->status,
                'nomor_sertifikat'       => $sertifikat->nomor_sertifikat,
                'tanggal_terbit'         => $tanggalTerbit->toDateString(),
                'tanggal_selesai_ujian'  => $ukk->tanggal_selesai?->toDateString(),
                'kompetensi'             => $ukk->kompetensi ?? [],
                'nama_sekolah'           => $ukk->nama_sekolah ?: $sekolah?->nama,
                'alamat_sekolah'         => $ukk->alamat_sekolah ?: $sekolah?->alamat,
                'nama_kepsek'            => $ukk->nama_kepsek ?: $sekolah?->nama_kepsek,
                'nip_kepsek'             => $ukk->nip_kepsek ?: $sekolah?->nip_kepsek,
                'nama_penguji_internal'  => $ukk->nama_penguji_internal,
                'nama_penguji_external'  => $ukk->nama_penguji_external,
                'nama_universitas'       => $ukk->nama_universitas ?: $sekolah?->nama_universitas,
                'logo_path'              => $sekolah?->logo_path,
                'background_template_path' => $sekolah?->background_template_path,
                'qr_base64'              => $qrBase64,
                'verify_url'             => $verifyUrl,
                'qr_base64_penguji'      => $qrBase64Penguji,
                'verify_url_penguji'     => $verifyUrlPenguji,
                // Digital signature data for the template
                'is_signed'                    => $isSigned,
                'is_signed_kepsek'             => $isSignedKepsek,
                'is_signed_penguji'            => $isSignedPenguji,
                'signature_fingerprint'        => $fingerprintKepsek,
                'signature_fingerprint_penguji' => $fingerprintPenguji,
                'signature_algorithm'          => $isSigned ? 'RSA-SHA256' : null,
                'signature_date'               => $isSigned ? $tanggalTerbit->format('d/m/Y H:i') : null,
            ];

            $pdf = Pdf::loadView('certificate.template', $data)
                ->setPaper('a4', 'portrait');

            $safeNomor = str_replace('/', '-', $sertifikat->nomor_sertifikat);
            $fileName  = 'sertifikat/' . Str::slug($siswa->nama) . '-' . $safeNomor . '.pdf';
            $pdfOutput = $pdf->output();

            Storage::disk('public')->put($fileName, $pdfOutput);

            $sertifikat->update([
                'status'                     => 'selesai',
                'file_path'                  => $fileName,
                'generated_at'               => $tanggalTerbit,
                'signature_payload'          => $signaturePayload,
                'digital_signature'          => $digitalSignatureKepsek,
                'is_signed'                  => $isSignedKepsek,
                'digital_signature_penguji'  => $digitalSignaturePenguji,
                'is_signed_penguji'          => $isSignedPenguji,
            ]);
        } catch (\Throwable $e) {
            $sertifikat->update([
                'status'        => 'gagal',
                'error_message' => $e->getMessage(),
            ]);

            throw $e;
        }

        return $sertifikat->fresh();
    }

    /**
     * Buat record Sertifikat baru lalu generate PDF-nya.
     */
    public function createAndGenerate(int $nilaiId): Sertifikat
    {
        $template = TemplateSertifikat::where('is_default', true)->firstOrFail();

        $sertifikat = Sertifikat::create([
            'nilai_id'         => $nilaiId,
            'template_id'      => $template->id,
            'nomor_sertifikat' => $this->generateNomor(),
            'status'           => 'pending',
        ]);

        return $this->generate($sertifikat);
    }

    private function generateNomor(): string
    {
        $tahun  = now()->format('Y');
        $urutan = str_pad(Sertifikat::whereYear('created_at', $tahun)->count() + 1, 4, '0', STR_PAD_LEFT);

        return "SKT/{$tahun}/{$urutan}";
    }
}
