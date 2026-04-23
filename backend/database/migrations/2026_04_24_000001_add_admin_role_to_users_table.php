<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('super_admin', 'admin', 'penguji_internal', 'penguji_external') NOT NULL DEFAULT 'penguji_internal'");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('super_admin', 'penguji_internal', 'penguji_external') NOT NULL DEFAULT 'penguji_internal'");
    }
};
