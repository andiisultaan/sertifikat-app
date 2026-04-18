<?php

namespace App\Http\Controllers;

use App\Jobs\GenerateCertificateJob;
use App\Models\Nilai;
use App\Models\Sertifikat;
use App\Models\TemplateSertifikat;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class SertifikatController extends Controller
{
    /**
     * Daftar semua sertifikat (dengan relasi nilai→siswa→ukk).
     */
    public function index(Request $request): JsonResponse
    {
        $sertifikat = Sertifikat::with(['nilai.siswa', 'nilai.ukk', 'template'])
            ->latest()
            ->paginate((int) $request->get('per_page', 15));

        return response()->json($sertifikat);
    }

    /**
     * Detail satu sertifikat.
     */
    public function show(int $id): JsonResponse
    {
        $sertifikat = Sertifikat::with(['nilai.siswa', 'nilai.ukk', 'template'])->findOrFail($id);

        return response()->json($sertifikat);
    }

    /**
     * Trigger generate sertifikat untuk satu nilai.
     * Jika sudah ada, generate ulang.
     */
    public function generate(Request $request): JsonResponse
    {
        $request->validate([
            'nilai_id' => ['required', 'exists:nilai,id'],
        ]);

        $nilai = Nilai::findOrFail($request->nilai_id);

        if (! $nilai->is_finalized && $nilai->nilai_akhir === null) {
            return response()->json([
                'message' => 'Nilai belum lengkap. Isi semua komponen nilai terlebih dahulu.',
            ], 422);
        }

        if ($nilai->status !== 'Lulus') {
            return response()->json([
                'message' => 'Sertifikat hanya dapat digenerate untuk siswa yang Lulus.',
            ], 422);
        }

        $template = TemplateSertifikat::where('is_default', true)->first();

        if (! $template) {
            return response()->json([
                'message' => 'Tidak ada template sertifikat default. Seed template terlebih dahulu.',
            ], 422);
        }

        // Buat atau ambil record sertifikat yang sudah ada
        $sertifikat = Sertifikat::firstOrCreate(
            ['nilai_id' => $nilai->id],
            [
                'template_id'      => $template->id,
                'nomor_sertifikat' => $this->generateNomor(),
                'status'           => 'pending',
            ]
        );

        // Reset status agar bisa generate ulang
        $sertifikat->update([
            'status'        => 'pending',
            'error_message' => null,
            'template_id'   => $template->id,
        ]);

        GenerateCertificateJob::dispatch($sertifikat->id);

        return response()->json([
            'message'    => 'Sertifikat sedang diproses.',
            'sertifikat' => $sertifikat->fresh(),
        ], 202);
    }

    /**
     * Download PDF sertifikat.
     */
    public function download(int $id): StreamedResponse|JsonResponse
    {
        $sertifikat = Sertifikat::with('nilai.siswa')->findOrFail($id);

        if ($sertifikat->status !== 'selesai' || ! $sertifikat->file_path) {
            return response()->json(['message' => 'PDF belum tersedia.'], 404);
        }

        if (! Storage::disk('public')->exists($sertifikat->file_path)) {
            return response()->json(['message' => 'File PDF tidak ditemukan di storage.'], 404);
        }

        $nama = $sertifikat->nilai->siswa->nama ?? 'sertifikat';

        return Storage::disk('public')->download(
            $sertifikat->file_path,
            'Sertifikat-' . str_replace(' ', '-', $nama) . '.pdf'
        );
    }

    /**
     * Hapus sertifikat beserta file PDF-nya.
     */
    public function destroy(int $id): JsonResponse
    {
        $sertifikat = Sertifikat::findOrFail($id);

        if ($sertifikat->file_path && Storage::disk('public')->exists($sertifikat->file_path)) {
            Storage::disk('public')->delete($sertifikat->file_path);
        }

        $sertifikat->delete();

        return response()->json(['message' => 'Sertifikat berhasil dihapus.']);
    }

    private function generateNomor(): string
    {
        $tahun  = now()->format('Y');
        $urutan = str_pad(Sertifikat::whereYear('created_at', $tahun)->count() + 1, 4, '0', STR_PAD_LEFT);

        return "SKT/{$tahun}/{$urutan}";
    }
}
