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

    protected $appends = ['logo_url', 'background_template_url'];

    protected $fillable = [
        'nama',
        'alamat',
        'nama_kepsek',
        'nip_kepsek',
        'nama_universitas',
        'logo_path',
        'background_template_path',
        'public_key',
        'public_key_penguji_eksternal',
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

    public function getLogoUrlAttribute(): ?string
    {
        if (! $this->logo_path) {
            return null;
        }

        return asset('storage/' . ltrim($this->logo_path, '/'));
    }

    public function getBackgroundTemplateUrlAttribute(): ?string
    {
        if (! $this->background_template_path) {
            return null;
        }

        return asset('storage/' . ltrim($this->background_template_path, '/'));
    }
}
