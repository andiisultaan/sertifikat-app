<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Siswa extends Model
{
    use SoftDeletes;

    protected $table = 'siswa';

    protected $fillable = [
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

    public function nilai(): HasMany
    {
        return $this->hasMany(Nilai::class);
    }
}
