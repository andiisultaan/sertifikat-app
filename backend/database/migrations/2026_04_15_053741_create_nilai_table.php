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
        Schema::create('nilai', function (Blueprint $table) {
            $table->id();
            $table->foreignId('siswa_id')->constrained('siswa')->cascadeOnDelete();
            $table->foreignId('ukk_id')->constrained('ukk')->cascadeOnDelete();
            $table->decimal('nilai_teori', 5, 2)->nullable();
            $table->decimal('nilai_praktik', 5, 2)->nullable();
            $table->decimal('nilai_portofolio', 5, 2)->nullable();
            // Kolom kalkulasi — diisi otomatis oleh NilaiService
            $table->decimal('nilai_akhir', 5, 2)->nullable();
            $table->enum('status', ['Lulus', 'Tidak Lulus'])->nullable();
            $table->enum('predikat', ['A', 'B', 'C', 'D'])->nullable();
            $table->boolean('is_finalized')->default(false);
            $table->timestamps();
            $table->unique(['siswa_id', 'ukk_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('nilai');
    }
};
