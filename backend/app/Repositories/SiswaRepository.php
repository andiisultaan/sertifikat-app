<?php

namespace App\Repositories;

use App\Models\Siswa;
use Illuminate\Pagination\LengthAwarePaginator;

class SiswaRepository
{
    public function paginate(int $perPage = 15, ?string $search = null): LengthAwarePaginator
    {
        return Siswa::query()
            ->when($search, fn ($q) => $q->where('nama', 'like', "%{$search}%")
                ->orWhere('nis', 'like', "%{$search}%"))
            ->latest()
            ->paginate($perPage);
    }

    public function findById(int $id): Siswa
    {
        return Siswa::findOrFail($id);
    }

    public function create(array $data): Siswa
    {
        return Siswa::create($data);
    }

    public function update(Siswa $siswa, array $data): Siswa
    {
        $siswa->update($data);

        return $siswa->fresh();
    }

    public function delete(Siswa $siswa): void
    {
        $siswa->delete();
    }
}
