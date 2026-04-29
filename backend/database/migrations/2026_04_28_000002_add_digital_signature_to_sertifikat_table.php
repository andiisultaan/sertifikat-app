<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('sertifikat', function (Blueprint $table) {
            $table->text('signature_payload')->nullable()->after('generated_at')
                ->comment('String kanonik yang ditandatangani (pipe-separated)');
            $table->text('digital_signature')->nullable()->after('signature_payload')
                ->comment('Tanda tangan digital dalam base64 (RSA-SHA256)');
            $table->boolean('is_signed')->default(false)->after('digital_signature')
                ->comment('Apakah sertifikat sudah ditandatangani secara digital');
        });
    }

    public function down(): void
    {
        Schema::table('sertifikat', function (Blueprint $table) {
            $table->dropColumn(['signature_payload', 'digital_signature', 'is_signed']);
        });
    }
};
