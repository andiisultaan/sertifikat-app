<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Ukk extends Model
{
    use SoftDeletes;

    protected $table = 'ukk';

    protected $fillable = [
        'nama',
        'judul_pengujian',
        'jurusan',
        'tahun',
        'tanggal_mulai',
        'tanggal_selesai',
        'status',
        'kompetensi',
        'nama_sekolah',
        'alamat_sekolah',
        'nama_kepsek',
        'nip_kepsek',
        'nama_penguji_internal',
        'nama_penguji_external',
        'nama_universitas',
    ];

    protected $casts = [
        'tanggal_mulai'   => 'date',
        'tanggal_selesai' => 'date',
        'kompetensi'      => 'array',
    ];

    public function nilai(): HasMany
    {
        return $this->hasMany(Nilai::class);
    }
}
