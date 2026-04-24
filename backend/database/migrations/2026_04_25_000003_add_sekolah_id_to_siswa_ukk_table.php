<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('siswa', function (Blueprint $table) {
            $table->foreignId('sekolah_id')
                ->nullable()
                ->after('id')
                ->constrained('sekolah')
                ->nullOnDelete();
        });

        Schema::table('ukk', function (Blueprint $table) {
            $table->foreignId('sekolah_id')
                ->nullable()
                ->after('id')
                ->constrained('sekolah')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('siswa', function (Blueprint $table) {
            $table->dropConstrainedForeignId('sekolah_id');
        });

        Schema::table('ukk', function (Blueprint $table) {
            $table->dropConstrainedForeignId('sekolah_id');
        });
    }
};
