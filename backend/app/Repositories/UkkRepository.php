<?php

namespace App\Repositories;

use App\Models\Ukk;
use Illuminate\Pagination\LengthAwarePaginator;

class UkkRepository
{
    public function paginate(int $perPage = 15, ?string $search = null, ?int $sekolahId = null): LengthAwarePaginator
    {
        return Ukk::query()
            ->when($sekolahId, fn ($q) => $q->where('sekolah_id', $sekolahId))
            ->when($search, fn ($q) => $q->where(function ($searchQuery) use ($search): void {
                $searchQuery->where('nama', 'like', "%{$search}%")
                    ->orWhere('jurusan', 'like', "%{$search}%");
            }))
            ->latest()
            ->paginate($perPage);
    }

    public function findById(int $id, ?int $sekolahId = null): Ukk
    {
        return Ukk::query()
            ->when($sekolahId, fn ($q) => $q->where('sekolah_id', $sekolahId))
            ->findOrFail($id);
    }

    public function create(array $data): Ukk
    {
        return Ukk::create($data);
    }

    public function update(Ukk $ukk, array $data): Ukk
    {
        $ukk->update($data);

        return $ukk->fresh();
    }

    public function delete(Ukk $ukk): void
    {
        $ukk->delete();
    }
}
