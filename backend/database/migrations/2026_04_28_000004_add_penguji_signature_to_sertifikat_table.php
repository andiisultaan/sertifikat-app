<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('sertifikat', function (Blueprint $table) {
            $table->text('digital_signature_penguji')->nullable()->after('digital_signature');
            $table->boolean('is_signed_penguji')->default(false)->after('is_signed');
        });
    }

    public function down(): void
    {
        Schema::table('sertifikat', function (Blueprint $table) {
            $table->dropColumn(['digital_signature_penguji', 'is_signed_penguji']);
        });
    }
};
