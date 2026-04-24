<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class Sekolah extends Model
{
    use SoftDeletes;

    protected $table = 'sekolah';

    protected $fillable = [
        'nama',
        'alamat',
        'nama_kepsek',
        'nip_kepsek',
        'nama_universitas',
    ];

    public function admin(): HasOne
    {
        return $this->hasOne(User::class)->where('role', 'admin');
    }

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    public function siswa(): HasMany
    {
        return $this->hasMany(Siswa::class);
    }

    public function ukk(): HasMany
    {
        return $this->hasMany(Ukk::class);
    }
}
