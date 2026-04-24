<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Siswa extends Model
{
    use SoftDeletes;

    protected $table = 'siswa';

    protected $fillable = [
        'sekolah_id',
        'nis',
        'nama',
        'tempat_lahir',
        'tanggal_lahir',
        'jenis_kelamin',
        'jurusan',
        'tahun_masuk',
    ];

    protected $casts = [
        'tanggal_lahir' => 'date',
    ];

    protected static function booted(): void
    {
        static::deleting(function (Siswa $siswa): void {
            $siswa->nilai()->delete();
        });
    }

    public function nilai(): HasMany
    {
        return $this->hasMany(Nilai::class);
    }

    public function sekolah(): BelongsTo
    {
        return $this->belongsTo(Sekolah::class);
    }
}
