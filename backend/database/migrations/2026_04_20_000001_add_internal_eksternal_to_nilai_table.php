<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('nilai', function (Blueprint $table) {
            // Tambah kolom nilai internal & eksternal setelah ukk_id
            $table->decimal('nilai_internal', 5, 2)->nullable()->after('ukk_id');
            $table->decimal('nilai_eksternal', 5, 2)->nullable()->after('nilai_internal');
        });

        // Ubah enum predikat menjadi varchar agar mendukung label panjang
        DB::statement("ALTER TABLE nilai MODIFY COLUMN predikat VARCHAR(30) NULL");
    }

    public function down(): void
    {
        Schema::table('nilai', function (Blueprint $table) {
            $table->dropColumn(['nilai_internal', 'nilai_eksternal']);
        });

        DB::statement("ALTER TABLE nilai MODIFY COLUMN predikat ENUM('A','B','C','D') NULL");
    }
};
