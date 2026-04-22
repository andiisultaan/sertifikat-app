<?php

namespace App\Http\Controllers;

use App\Models\Sertifikat;
use Illuminate\Http\JsonResponse;

class CertificateVerifyController extends Controller
{
    /**
     * Verifikasi sertifikat berdasarkan qr_token.
     * Route publik — tidak memerlukan autentikasi.
     */
    public function verify(string $token): JsonResponse
    {
        $sertifikat = Sertifikat::with(['nilai.siswa', 'nilai.ukk'])
            ->where('qr_token', $token)
            ->where('status', 'selesai')
            ->first();

        if (! $sertifikat) {
            return response()->json([
                'valid'   => false,
                'message' => 'Sertifikat tidak ditemukan atau tidak valid.',
            ], 404);
        }

        $nilai = $sertifikat->nilai;
        $siswa = $nilai->siswa;
        $ukk   = $nilai->ukk;

        return response()->json([
            'valid'              => true,
            'message'            => 'Sertifikat valid dan terverifikasi.',
            'nomor_sertifikat'   => $sertifikat->nomor_sertifikat,
            'nama'               => $siswa->nama,
            'nis'                => $siswa->nis,
            'jurusan'            => $siswa->jurusan,
            'nama_ukk'           => $ukk->nama,
            'predikat'           => $nilai->predikat,
            'nilai_akhir'        => $nilai->nilai_akhir,
            'tanggal_terbit'     => $sertifikat->generated_at?->format('d F Y'),
            'masa_berlaku'       => $sertifikat->generated_at?->addYears(3)->format('d F Y'),
        ]);
    }
}
