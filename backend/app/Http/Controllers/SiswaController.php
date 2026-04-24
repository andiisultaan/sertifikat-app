<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreSiswaRequest;
use App\Http\Requests\UpdateSiswaRequest;
use App\Repositories\SiswaRepository;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SiswaController extends Controller
{
    public function __construct(private SiswaRepository $repo) {}

    public function index(Request $request): JsonResponse
    {
        $sekolahId = $this->getSekolahId($request);

        $siswa = $this->repo->paginate(
            perPage: (int) $request->get('per_page', 15),
            search: $request->get('search'),
            sekolahId: $sekolahId,
        );

        return response()->json($siswa);
    }

    public function store(StoreSiswaRequest $request): JsonResponse
    {
        $data = $request->validated();
        if ($sekolahId = $this->getSekolahId($request)) {
            $data['sekolah_id'] = $sekolahId;
        }

        $siswa = $this->repo->create($data);

        return response()->json($siswa, 201);
    }

    public function show(Request $request, int $id): JsonResponse
    {
        return response()->json($this->repo->findById($id, $this->getSekolahId($request)));
    }

    public function update(UpdateSiswaRequest $request, int $id): JsonResponse
    {
        $sekolahId = $this->getSekolahId($request);
        $siswa = $this->repo->findById($id, $sekolahId);
        $data = $request->validated();

        if ($sekolahId) {
            $data['sekolah_id'] = $sekolahId;
        }

        return response()->json($this->repo->update($siswa, $data));
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $siswa = $this->repo->findById($id, $this->getSekolahId($request));
        $this->repo->delete($siswa);

        return response()->json(['message' => 'Siswa berhasil dihapus.']);
    }

    private function getSekolahId(Request $request): ?int
    {
        return $request->integer('_sekolah_id') ?: null;
    }
}
