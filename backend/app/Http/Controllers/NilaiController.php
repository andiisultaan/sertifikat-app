<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreNilaiRequest;
use App\Http\Requests\UpdateNilaiRequest;
use App\Repositories\NilaiRepository;
use App\Models\Siswa;
use App\Models\Ukk;
use App\Services\NilaiService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NilaiController extends Controller
{
    public function __construct(
        private NilaiRepository $repo,
        private NilaiService $nilaiService,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $sekolahId = $this->getSekolahId($request);
        if (! $sekolahId && $request->user()?->isSuperAdmin()) {
            $sekolahId = $request->integer('sekolah_id') ?: null;
        }

        $nilai = $this->repo->paginate(
            perPage: (int) $request->get('per_page', 15),
            ukkId: $request->get('ukk_id') ? (int) $request->get('ukk_id') : null,
            siswaId: $request->get('siswa_id') ? (int) $request->get('siswa_id') : null,
            sekolahId: $sekolahId,
        );

        return response()->json($nilai);
    }

    public function store(StoreNilaiRequest $request): JsonResponse
    {
        $data = $request->validated();
        $role = $request->user()->role;
        $sekolahId = $this->getSekolahId($request);

        if ($sekolahId) {
            $siswaInScope = Siswa::whereKey($data['siswa_id'])->where('sekolah_id', $sekolahId)->exists();
            $ukkInScope = Ukk::whereKey($data['ukk_id'])->where('sekolah_id', $sekolahId)->exists();

            if (! $siswaInScope || ! $ukkInScope) {
                return response()->json(['message' => 'Akses ditolak untuk data sekolah lain.'], 403);
            }
        }

        // Penguji hanya boleh mengisi field miliknya
        if ($role === 'penguji_internal') {
            $data['nilai_eksternal'] = null;
        } elseif ($role === 'penguji_external') {
            $data['nilai_internal'] = null;
        }

        $kalkulasi = $this->nilaiService->hitungNilaiAkhir([
            'nilai_internal'  => $data['nilai_internal'] ?? null,
            'nilai_eksternal' => $data['nilai_eksternal'] ?? null,
        ]);

        $nilai = $this->repo->create(array_merge($data, $kalkulasi));

        return response()->json($nilai->load(['siswa', 'ukk']), 201);
    }

    public function show(Request $request, int $id): JsonResponse
    {
        return response()->json($this->repo->findById($id, $this->getSekolahId($request)));
    }

    public function update(UpdateNilaiRequest $request, int $id): JsonResponse
    {
        $nilai = $this->repo->findById($id, $this->getSekolahId($request));
        $data  = $request->validated();
        $role  = $request->user()->role;

        // Penguji hanya boleh mengubah field miliknya
        if ($role === 'penguji_internal') {
            unset($data['nilai_eksternal']);
        } elseif ($role === 'penguji_external') {
            unset($data['nilai_internal']);
        }

        $kalkulasi = $this->nilaiService->hitungNilaiAkhir([
            'nilai_internal'  => $data['nilai_internal']  ?? $nilai->nilai_internal,
            'nilai_eksternal' => $data['nilai_eksternal'] ?? $nilai->nilai_eksternal,
        ]);

        return response()->json($this->repo->update($nilai, array_merge($data, $kalkulasi)));
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $nilai = $this->repo->findById($id, $this->getSekolahId($request));
        $this->repo->delete($nilai);

        return response()->json(['message' => 'Nilai berhasil dihapus.']);
    }

    private function getSekolahId(Request $request): ?int
    {
        return $request->integer('_sekolah_id') ?: null;
    }
}
