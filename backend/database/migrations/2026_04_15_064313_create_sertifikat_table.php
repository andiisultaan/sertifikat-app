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
        Schema::create('sertifikat', function (Blueprint $table) {
            $table->id();
            $table->foreignId('nilai_id')->unique()->constrained('nilai')->cascadeOnDelete();
            $table->foreignId('template_id')->constrained('template_sertifikat');
            $table->string('nomor_sertifikat')->unique();
            $table->string('file_path')->nullable()->comment('Path PDF di storage');
            $table->enum('status', ['pending', 'processing', 'selesai', 'gagal'])->default('pending');
            $table->text('error_message')->nullable();
            $table->timestamp('generated_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sertifikat');
    }
};
