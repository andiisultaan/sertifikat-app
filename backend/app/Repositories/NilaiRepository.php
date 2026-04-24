<?php

namespace App\Repositories;

use App\Models\Nilai;
use Illuminate\Pagination\LengthAwarePaginator;

class NilaiRepository
{
    public function paginate(int $perPage = 15, ?int $ukkId = null, ?int $siswaId = null, ?int $sekolahId = null): LengthAwarePaginator
    {
        return Nilai::with(['siswa', 'ukk'])
            ->when($sekolahId, fn ($q) => $q->whereHas('ukk', fn ($ukkQuery) => $ukkQuery->where('sekolah_id', $sekolahId)))
            ->when($ukkId, fn ($q) => $q->where('ukk_id', $ukkId))
            ->when($siswaId, fn ($q) => $q->where('siswa_id', $siswaId))
            ->latest()
            ->paginate($perPage);
    }

    public function findById(int $id, ?int $sekolahId = null): Nilai
    {
        return Nilai::with(['siswa', 'ukk'])
            ->when($sekolahId, fn ($q) => $q->whereHas('ukk', fn ($ukkQuery) => $ukkQuery->where('sekolah_id', $sekolahId)))
            ->findOrFail($id);
    }

    public function findBySiswaAndUkk(int $siswaId, int $ukkId, ?int $sekolahId = null): ?Nilai
    {
        return Nilai::where('siswa_id', $siswaId)
            ->where('ukk_id', $ukkId)
            ->when($sekolahId, fn ($q) => $q->whereHas('ukk', fn ($ukkQuery) => $ukkQuery->where('sekolah_id', $sekolahId)))
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
