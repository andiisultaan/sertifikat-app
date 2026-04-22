<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Sertifikat extends Model
{
    protected $table = 'sertifikat';

    protected $fillable = [
        'nilai_id',
        'template_id',
        'nomor_sertifikat',
        'qr_token',
        'file_path',
        'status',
        'error_message',
        'generated_at',
    ];

    protected $casts = [
        'generated_at' => 'datetime',
    ];

    public function nilai(): BelongsTo
    {
        return $this->belongsTo(Nilai::class);
    }

    public function template(): BelongsTo
    {
        return $this->belongsTo(TemplateSertifikat::class, 'template_id');
    }
}
