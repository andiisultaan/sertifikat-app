<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TemplateSertifikat extends Model
{
    protected $table = 'template_sertifikat';

    protected $fillable = [
        'nama',
        'konten_html',
        'is_default',
    ];

    protected $casts = [
        'is_default' => 'boolean',
    ];

    public function sertifikat(): HasMany
    {
        return $this->hasMany(Sertifikat::class, 'template_id');
    }
}
