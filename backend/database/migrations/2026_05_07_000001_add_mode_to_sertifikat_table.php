<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('sertifikat', function (Blueprint $table) {
            // 'digital' = generate dengan tanda tangan digital (jika kunci tersedia)
            // 'basah'   = generate dengan ruang kosong untuk tanda tangan basah
            $table->enum('mode', ['digital', 'basah'])->default('digital')->after('status');
        });
    }

    public function down(): void
    {
        Schema::table('sertifikat', function (Blueprint $table) {
            $table->dropColumn('mode');
        });
    }
};
