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
        'qr_token_penguji',
        'file_path',
        'status',
        'error_message',
        'generated_at',
        'signature_payload',
        'digital_signature',
        'is_signed',
        'digital_signature_penguji',
        'is_signed_penguji',
    ];

    protected $casts = [
        'generated_at'      => 'datetime',
        'is_signed'         => 'boolean',
        'is_signed_penguji' => 'boolean',
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
