<?php

namespace App\Repositories;

use App\Models\Nilai;
use Illuminate\Pagination\LengthAwarePaginator;

class NilaiRepository
{
    public function paginate(int $perPage = 15, ?int $ukkId = null, ?int $siswaId = null): LengthAwarePaginator
    {
        return Nilai::with(['siswa', 'ukk'])
            ->when($ukkId, fn ($q) => $q->where('ukk_id', $ukkId))
            ->when($siswaId, fn ($q) => $q->where('siswa_id', $siswaId))
            ->latest()
            ->paginate($perPage);
    }

    public function findById(int $id): Nilai
    {
        return Nilai::with(['siswa', 'ukk'])->findOrFail($id);
    }

    public function findBySiswaAndUkk(int $siswaId, int $ukkId): ?Nilai
    {
        return Nilai::where('siswa_id', $siswaId)
            ->where('ukk_id', $ukkId)
            ->first();
    }

    public function create(array $data): Nilai
    {
        return Nilai::create($data);
    }

    public function update(Nilai $nilai, array $data): Nilai
    {
        $nilai->update($data);

        return $nilai->fresh(['siswa', 'ukk']);
    }

    public function delete(Nilai $nilai): void
    {
        $nilai->delete();
    }
}
