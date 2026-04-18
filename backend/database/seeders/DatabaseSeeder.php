<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        User::firstOrCreate(['email' => 'admin@sekolah.sch.id'], [
            'name'     => 'Super Admin',
            'password' => Hash::make('password'),
            'role'     => 'super_admin',
        ]);

        User::firstOrCreate(['email' => 'internal@sekolah.sch.id'], [
            'name'     => 'Penguji Internal',
            'password' => Hash::make('password'),
            'role'     => 'penguji_internal',
        ]);

        User::firstOrCreate(['email' => 'external@sekolah.sch.id'], [
            'name'     => 'Penguji External',
            'password' => Hash::make('password'),
            'role'     => 'penguji_external',
        ]);

        $this->call(TemplateSertifikatSeeder::class);
    }
}
