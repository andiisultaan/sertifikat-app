<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreNilaiRequest;
use App\Http\Requests\UpdateNilaiRequest;
use App\Repositories\NilaiRepository;
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
        $nilai = $this->repo->paginate(
            perPage: (int) $request->get('per_page', 15),
            ukkId: $request->get('ukk_id') ? (int) $request->get('ukk_id') : null,
            siswaId: $request->get('siswa_id') ? (int) $request->get('siswa_id') : null,
        );

        return response()->json($nilai);
    }

    public function store(StoreNilaiRequest $request): JsonResponse
    {
        $data = $request->validated();
        $kalkulasi = $this->nilaiService->hitungNilaiAkhir([
            'nilai_teori'      => $data['nilai_teori'] ?? null,
            'nilai_praktik'    => $data['nilai_praktik'] ?? null,
            'nilai_portofolio' => $data['nilai_portofolio'] ?? null,
        ]);

        $nilai = $this->repo->create(array_merge($data, $kalkulasi));

        return response()->json($nilai->load(['siswa', 'ukk']), 201);
    }

    public function show(int $id): JsonResponse
    {
        return response()->json($this->repo->findById($id));
    }

    public function update(UpdateNilaiRequest $request, int $id): JsonResponse
    {
        $nilai = $this->repo->findById($id);
        $data = $request->validated();

        $kalkulasi = $this->nilaiService->hitungNilaiAkhir([
            'nilai_teori'      => $data['nilai_teori'] ?? $nilai->nilai_teori,
            'nilai_praktik'    => $data['nilai_praktik'] ?? $nilai->nilai_praktik,
            'nilai_portofolio' => $data['nilai_portofolio'] ?? $nilai->nilai_portofolio,
        ]);

        return response()->json($this->repo->update($nilai, array_merge($data, $kalkulasi)));
    }

    public function destroy(int $id): JsonResponse
    {
        $nilai = $this->repo->findById($id);
        $this->repo->delete($nilai);

        return response()->json(['message' => 'Nilai berhasil dihapus.']);
    }
}
