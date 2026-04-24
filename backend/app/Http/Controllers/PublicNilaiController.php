<?php

namespace App\Http\Controllers;

use App\Models\Nilai;
use App\Models\Sekolah;
use App\Models\Siswa;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PublicNilaiController extends Controller
{
    public function schools(): JsonResponse
    {
        $schools = Sekolah::query()
            ->select(['id', 'nama'])
            ->orderBy('nama')
            ->get();

        return response()->json($schools);
    }

    public function search(Request $request): JsonResponse
    {
        $data = $request->validate([
            'sekolah_id' => ['required', 'integer', 'exists:sekolah,id'],
            'nis'        => ['nullable', 'string', 'max:20'],
            'nama'       => ['nullable', 'string', 'max:255'],
        ]);

        $nis = trim((string) ($data['nis'] ?? ''));
        $nama = trim((string) ($data['nama'] ?? ''));

        if ($nis === '' && $nama === '') {
            return response()->json([
                'message' => 'Isi minimal NIS atau nama siswa.',
            ], 422);
        }

        $siswaQuery = Siswa::query()
            ->where('sekolah_id', (int) $data['sekolah_id'])
            ->when($nis !== '', fn ($q) => $q->where('nis', $nis))
            ->when($nama !== '', fn ($q) => $q->where('nama', 'like', '%' . $nama . '%'));

        $siswa = $siswaQuery->orderBy('nama')->first();

        if (! $siswa) {
            return response()->json([
                'message' => 'Data siswa tidak ditemukan untuk kriteria pencarian tersebut.',
            ], 404);
        }

        $nilai = Nilai::query()
            ->with(['ukk:id,nama,jurusan,tahun,tanggal_mulai,tanggal_selesai', 'siswa:id,sekolah_id,nis,nama,jurusan'])
            ->where('siswa_id', $siswa->id)
            ->latest()
            ->get()
            ->map(function (Nilai $item) {
                return [
                    'id'              => $item->id,
                    'nilai_internal'  => $item->nilai_internal,
                    'nilai_eksternal' => $item->nilai_eksternal,
                    'nilai_akhir'     => $item->nilai_akhir,
                    'predikat'        => $item->predikat,
                    'status'          => $item->status,
                    'is_finalized'    => $item->is_finalized,
                    'updated_at'      => $item->updated_at,
                    'ukk'             => $item->ukk,
                ];
            });

        return response()->json([
            'siswa' => [
                'id'         => $siswa->id,
                'nis'        => $siswa->nis,
                'nama'       => $siswa->nama,
                'jurusan'    => $siswa->jurusan,
                'sekolah_id' => $siswa->sekolah_id,
            ],
            'nilai' => $nilai,
        ]);
    }
}
