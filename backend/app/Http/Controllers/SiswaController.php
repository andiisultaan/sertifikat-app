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
        $siswa = $this->repo->paginate(
            perPage: (int) $request->get('per_page', 15),
            search: $request->get('search'),
        );

        return response()->json($siswa);
    }

    public function store(StoreSiswaRequest $request): JsonResponse
    {
        $siswa = $this->repo->create($request->validated());

        return response()->json($siswa, 201);
    }

    public function show(int $id): JsonResponse
    {
        return response()->json($this->repo->findById($id));
    }

    public function update(UpdateSiswaRequest $request, int $id): JsonResponse
    {
        $siswa = $this->repo->findById($id);

        return response()->json($this->repo->update($siswa, $request->validated()));
    }

    public function destroy(int $id): JsonResponse
    {
        $siswa = $this->repo->findById($id);
        $this->repo->delete($siswa);

        return response()->json(['message' => 'Siswa berhasil dihapus.']);
    }
}
