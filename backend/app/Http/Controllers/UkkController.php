<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreUkkRequest;
use App\Http\Requests\UpdateUkkRequest;
use App\Repositories\UkkRepository;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UkkController extends Controller
{
    public function __construct(private UkkRepository $repo) {}

    public function index(Request $request): JsonResponse
    {
        $sekolahId = $this->getSekolahId($request);
        if (! $sekolahId && $request->user()?->isSuperAdmin()) {
            $sekolahId = $request->integer('sekolah_id') ?: null;
        }

        $ukk = $this->repo->paginate(
            perPage: (int) $request->get('per_page', 15),
            search: $request->get('search'),
            sekolahId: $sekolahId,
        );

        return response()->json($ukk);
    }

    public function store(StoreUkkRequest $request): JsonResponse
    {
        $data = $request->validated();
        if ($sekolahId = $this->getSekolahId($request)) {
            $data['sekolah_id'] = $sekolahId;
        }

        $ukk = $this->repo->create($data);

        return response()->json($ukk, 201);
    }

    public function show(Request $request, int $id): JsonResponse
    {
        return response()->json($this->repo->findById($id, $this->getSekolahId($request)));
    }

    public function update(UpdateUkkRequest $request, int $id): JsonResponse
    {
        $sekolahId = $this->getSekolahId($request);
        $ukk = $this->repo->findById($id, $sekolahId);
        $data = $request->validated();

        if ($sekolahId) {
            $data['sekolah_id'] = $sekolahId;
        }

        return response()->json($this->repo->update($ukk, $data));
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $ukk = $this->repo->findById($id, $this->getSekolahId($request));
        $this->repo->delete($ukk);

        return response()->json(['message' => 'UKK berhasil dihapus.']);
    }

    private function getSekolahId(Request $request): ?int
    {
        return $request->integer('_sekolah_id') ?: null;
    }
}
