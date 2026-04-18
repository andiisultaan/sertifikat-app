<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Nilai extends Model
{
    protected $table = 'nilai';

    protected $fillable = [
        'siswa_id',
        'ukk_id',
        'nilai_teori',
        'nilai_praktik',
        'nilai_portofolio',
        'nilai_akhir',
        'status',
        'predikat',
        'is_finalized',
    ];

    protected $casts = [
        'nilai_teori'      => 'float',
        'nilai_praktik'    => 'float',
        'nilai_portofolio' => 'float',
        'nilai_akhir'      => 'float',
        'is_finalized'     => 'boolean',
    ];

    public function siswa(): BelongsTo
    {
        return $this->belongsTo(Siswa::class);
    }

    public function ukk(): BelongsTo
    {
        return $this->belongsTo(Ukk::class);
    }

    public function sertifikat(): HasOne
    {
        return $this->hasOne(Sertifikat::class);
    }
}
