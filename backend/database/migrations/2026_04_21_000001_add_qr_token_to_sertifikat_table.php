<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('sertifikat', function (Blueprint $table) {
            $table->string('qr_token', 64)->nullable()->unique()->after('nomor_sertifikat');
        });

        // Isi qr_token untuk record yang sudah ada
        \App\Models\Sertifikat::whereNull('qr_token')->each(function ($s) {
            $s->update(['qr_token' => Str::random(32)]);
        });
    }

    public function down(): void
    {
        Schema::table('sertifikat', function (Blueprint $table) {
            $table->dropColumn('qr_token');
        });
    }
};
