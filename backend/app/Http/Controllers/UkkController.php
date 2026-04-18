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
        $ukk = $this->repo->paginate(
            perPage: (int) $request->get('per_page', 15),
            search: $request->get('search'),
        );

        return response()->json($ukk);
    }

    public function store(StoreUkkRequest $request): JsonResponse
    {
        $ukk = $this->repo->create($request->validated());

        return response()->json($ukk, 201);
    }

    public function show(int $id): JsonResponse
    {
        return response()->json($this->repo->findById($id));
    }

    public function update(UpdateUkkRequest $request, int $id): JsonResponse
    {
        $ukk = $this->repo->findById($id);

        return response()->json($this->repo->update($ukk, $request->validated()));
    }

    public function destroy(int $id): JsonResponse
    {
        $ukk = $this->repo->findById($id);
        $this->repo->delete($ukk);

        return response()->json(['message' => 'UKK berhasil dihapus.']);
    }
}
