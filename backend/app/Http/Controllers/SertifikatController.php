<?php

namespace App\Http\Controllers;

use App\Models\Nilai;
use App\Models\Sertifikat;
use App\Models\TemplateSertifikat;
use App\Services\CertificateService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class SertifikatController extends Controller
{
    public function __construct(private CertificateService $certificateService) {}

    /**
     * Daftar semua sertifikat (dengan relasi nilai→siswa→ukk).
     */
    public function index(Request $request): JsonResponse
    {
        $sertifikat = $this->applySekolahScope(
            Sertifikat::with(['nilai.siswa', 'nilai.ukk', 'template']),
            $request
        )->latest()->paginate((int) $request->query('per_page', 15));

        return response()->json($sertifikat);
    }

    /**
     * Detail satu sertifikat.
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $sertifikat = $this->applySekolahScope(
            Sertifikat::with(['nilai.siswa', 'nilai.ukk', 'template']),
            $request
        )->findOrFail($id);

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

        $nilai = $this->applySekolahScope(Nilai::query(), $request)->findOrFail($request->nilai_id);

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

        // Token deterministik berbasis nilai_id + app key
        // Sehingga token selalu sama meski sertifikat dihapus & dibuat ulang
        $qrToken = substr(hash_hmac('sha256', 'sertifikat-nilai-' . $nilai->id, config('app.key')), 0, 32);

        // Buat atau ambil record sertifikat yang sudah ada
        $sertifikat = Sertifikat::firstOrCreate(
            ['nilai_id' => $nilai->id],
            [
                'template_id'      => $template->id,
                'nomor_sertifikat' => $this->generateNomor(),
                'qr_token'         => $qrToken,
                'status'           => 'pending',
            ]
        );

        // Pastikan qr_token selalu sinkron (update jika berbeda dari yang deterministik)
        if ($sertifikat->qr_token !== $qrToken) {
            $sertifikat->update(['qr_token' => $qrToken]);
        }

        // Reset status agar bisa generate ulang
        $sertifikat->update([
            'status'        => 'pending',
            'error_message' => null,
            'template_id'   => $template->id,
        ]);

        // Proses sinkronus — langsung generate PDF tanpa queue
        $result = $this->certificateService->generate($sertifikat);

        return response()->json([
            'message'    => 'Sertifikat berhasil digenerate.',
            'sertifikat' => $result,
        ], 200);
    }

    /**
     * Download PDF sertifikat.
     */
    public function download(Request $request, int $id): BinaryFileResponse|JsonResponse
    {
        $sertifikat = $this->applySekolahScope(
            Sertifikat::with('nilai.siswa'),
            $request
        )->findOrFail($id);

        if ($sertifikat->status !== 'selesai' || ! $sertifikat->file_path) {
            return response()->json(['message' => 'PDF belum tersedia.'], 404);
        }

        if (! Storage::disk('public')->exists($sertifikat->file_path)) {
            return response()->json(['message' => 'File PDF tidak ditemukan di storage.'], 404);
        }

        $nama = $sertifikat->nilai->siswa->nama ?? 'sertifikat';
        $path = Storage::disk('public')->path($sertifikat->file_path);

        return response()->download(
            $path,
            'Sertifikat-' . str_replace(' ', '-', $nama) . '.pdf',
            ['Content-Type' => 'application/pdf']
        );
    }

    /**
     * Hapus sertifikat beserta file PDF-nya.
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $sertifikat = $this->applySekolahScope(Sertifikat::query(), $request)->findOrFail($id);

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

    private function applySekolahScope($query, Request $request)
    {
        $sekolahId = $request->integer('_sekolah_id') ?: null;

        if (! $sekolahId) {
            return $query;
        }

        if ($query instanceof \Illuminate\Database\Eloquent\Builder && $query->getModel() instanceof Nilai) {
            return $query->whereHas('ukk', fn ($ukkQuery) => $ukkQuery->where('sekolah_id', $sekolahId));
        }

        return $query->whereHas('nilai.ukk', fn ($ukkQuery) => $ukkQuery->where('sekolah_id', $sekolahId));
    }
}
