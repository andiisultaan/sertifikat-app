<?php

use App\Models\Sekolah;
use App\Models\Siswa;
use App\Models\Ukk;
use App\Models\User;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        $sekolah = Sekolah::firstOrCreate(
            ['nama' => 'SMKN 1 Default'],
            ['alamat' => null, 'nama_kepsek' => null, 'nip_kepsek' => null, 'nama_universitas' => null]
        );

        Ukk::whereNull('sekolah_id')->update(['sekolah_id' => $sekolah->id]);
        Siswa::whereNull('sekolah_id')->update(['sekolah_id' => $sekolah->id]);
        User::where('role', 'admin')->whereNull('sekolah_id')->update(['sekolah_id' => $sekolah->id]);
    }

    public function down(): void
    {
        Ukk::whereNotNull('sekolah_id')->update(['sekolah_id' => null]);
        Siswa::whereNotNull('sekolah_id')->update(['sekolah_id' => null]);
        User::where('role', 'admin')->whereNotNull('sekolah_id')->update(['sekolah_id' => null]);
    }
};
