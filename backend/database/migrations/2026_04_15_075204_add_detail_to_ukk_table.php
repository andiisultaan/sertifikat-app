<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('ukk', function (Blueprint $table) {
            $table->string('judul_pengujian')->nullable()->after('nama')->comment('Deskripsi singkat judul pengujian');
            $table->json('kompetensi')->nullable()->after('judul_pengujian')->comment('Array [{kode, judul}] kompetensi yang diuji');
            $table->string('nama_sekolah')->nullable()->after('kompetensi');
            $table->string('alamat_sekolah')->nullable()->after('nama_sekolah');
            $table->string('nama_kepsek')->nullable()->after('alamat_sekolah');
            $table->string('nip_kepsek')->nullable()->after('nama_kepsek');
            $table->string('nama_penguji_internal')->nullable()->after('nip_kepsek');
            $table->string('nama_penguji_external')->nullable()->after('nama_penguji_internal');
            $table->string('nama_universitas')->nullable()->after('nama_penguji_external');
        });
    }

    public function down(): void
    {
        Schema::table('ukk', function (Blueprint $table) {
            $table->dropColumn([
                'judul_pengujian','kompetensi','nama_sekolah','alamat_sekolah',
                'nama_kepsek','nip_kepsek','nama_penguji_internal',
                'nama_penguji_external','nama_universitas',
            ]);
        });
    }
};
