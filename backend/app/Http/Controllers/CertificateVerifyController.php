<?php

namespace App\Http\Controllers;

use App\Models\Sertifikat;
use App\Services\DigitalSignatureService;
use Illuminate\Http\JsonResponse;

class CertificateVerifyController extends Controller
{
    public function __construct(
        private readonly DigitalSignatureService $sigService,
    ) {}

    /**
     * Verifikasi sertifikat berdasarkan qr_token.
     * Route publik — tidak memerlukan autentikasi.
     */
    public function verify(string $token): JsonResponse
    {
        // Cari berdasarkan qr_token (kepsek) atau qr_token_penguji
        $sertifikat = Sertifikat::with(['nilai.siswa', 'nilai.ukk.sekolah'])
            ->where('status', 'selesai')
            ->where(function ($q) use ($token) {
                $q->where('qr_token', $token)
                  ->orWhere('qr_token_penguji', $token);
            })
            ->first();

        if (! $sertifikat) {
            return response()->json([
                'valid'   => false,
                'message' => 'Sertifikat tidak ditemukan atau tidak valid.',
            ], 404);
        }

        // Tentukan jenis penanda tangan berdasarkan token yang cocok
        $isKepsek = $sertifikat->qr_token === $token;
        $signerRole = $isKepsek ? 'kepsek' : 'penguji_eksternal';

        $nilai = $sertifikat->nilai;
        $siswa = $nilai->siswa;
        $ukk   = $nilai->ukk;
        $sekolah = $ukk?->sekolah;

        // Nama dan jabatan penanda tangan sesuai QR yang dipindai
        if ($isKepsek) {
            $signerNama    = $ukk->nama_kepsek ?: $sekolah?->nama_kepsek;
            $signerJabatan = 'Kepala Sekolah';
            $signerNip     = $ukk->nip_kepsek ?: $sekolah?->nip_kepsek;
        } else {
            $signerNama    = $ukk->nama_penguji_external;
            $signerJabatan = 'Penguji Eksternal';
            $signerNip     = null;
        }

        // ── Digital Signature Verification ──────────────────────────────────
        // Verifikasi tanda tangan sesuai role QR yang dipindai
        $sigResult = $this->sigService->verifyByRole($sertifikat, $signerRole);
        // 1 = valid, 0 = tampered, -1 = key error, null = not signed
        $signatureStatus = match ($sigResult) {
            1       => 'valid',
            0       => 'invalid',
            -1      => 'error',
            default => 'not_signed',
        };

        // Fingerprint dari tanda tangan yang relevan
        $relevantSignature = $isKepsek
            ? $sertifikat->digital_signature
            : $sertifikat->digital_signature_penguji;
        $relevantIsSigned = $isKepsek
            ? $sertifikat->is_signed
            : $sertifikat->is_signed_penguji;

        return response()->json([
            'valid'              => true,
            'message'            => 'Sertifikat valid dan terverifikasi.',
            'nomor_sertifikat'   => $sertifikat->nomor_sertifikat,
            'nama'               => $siswa->nama,
            'nisn'               => $siswa->nisn,
            'jurusan'            => $siswa->jurusan,
            'nama_ukk'           => $ukk->nama,
            'predikat'           => $nilai->predikat,
            'nilai_akhir'        => $nilai->nilai_akhir,
            'tanggal_terbit'     => $sertifikat->generated_at?->format('d F Y'),
            'masa_berlaku'       => $sertifikat->generated_at?->addYears(3)->format('d F Y'),
            // Signer info berdasarkan QR yang dipindai
            'signer_role'        => $signerRole,
            'signer_jabatan'     => $signerJabatan,
            'signer_nama'        => $signerNama,
            'signer_nip'         => $signerNip,
            // Signature info untuk tanda tangan yang di-scan
            'digital_signature'  => [
                'status'      => $signatureStatus,
                'is_signed'   => $relevantIsSigned,
                'algorithm'   => $relevantIsSigned ? 'RSA-SHA256' : null,
                'fingerprint' => $relevantIsSigned && $relevantSignature
                    ? strtoupper(substr(hash('sha256', $relevantSignature), 0, 32))
                    : null,
            ],
        ]);
    }
}

