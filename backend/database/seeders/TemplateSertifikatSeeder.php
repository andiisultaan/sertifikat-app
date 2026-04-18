<?php

namespace Database\Seeders;

use App\Models\TemplateSertifikat;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\File;

class TemplateSertifikatSeeder extends Seeder
{
    public function run(): void
    {
        $templateHtml = File::get(resource_path('views/certificate/template.blade.php'));

        TemplateSertifikat::updateOrCreate(
            ['nama' => 'Template Default 2025'],
            [
                'konten_html' => $templateHtml,
                'is_default'  => true,
            ]
        );
    }
}
