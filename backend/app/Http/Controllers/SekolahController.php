<?php

namespace App\Http\Controllers;

use App\Models\Sekolah;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class SekolahController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->isAdmin()) {
            $sekolah = Sekolah::with('admin')->whereKey($user->sekolah_id)->get();

            return response()->json($sekolah);
        }

        return response()->json(Sekolah::with('admin')->orderBy('nama')->get());
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'nama' => ['required', 'string', 'max:255'],
        ]);

        $result = null;
        DB::transaction(function () use ($request, &$result): void {
            $sekolah = Sekolah::create(['nama' => $request->string('nama')->toString()]);

            $slug = Str::slug($sekolah->nama);
            $slug = $slug !== '' ? $slug : 'sekolah-' . $sekolah->id;

            $email = $this->generateUniqueAdminEmail($slug);
            $password = Str::random(12);

            $admin = User::create([
                'name'       => 'Admin ' . $sekolah->nama,
                'email'      => $email,
                'password'   => Hash::make($password),
                'role'       => 'admin',
                'sekolah_id' => $sekolah->id,
            ]);

            $result = [
                'sekolah' => $sekolah,
                'admin'   => [
                    'id'       => $admin->id,
                    'name'     => $admin->name,
                    'email'    => $admin->email,
                    'password' => $password,
                ],
            ];
        });

        return response()->json($result, 201);
    }

    public function show(Request $request, Sekolah $sekolah): JsonResponse
    {
        $user = $request->user();

        if ($user->isAdmin() && $user->sekolah_id !== $sekolah->id) {
            return response()->json(['message' => 'Akses ditolak.'], 403);
        }

        return response()->json($sekolah->load('admin'));
    }

    public function update(Request $request, Sekolah $sekolah): JsonResponse
    {
        $user = $request->user();

        if ($user->isAdmin() && $user->sekolah_id !== $sekolah->id) {
            return response()->json(['message' => 'Akses ditolak.'], 403);
        }

        $data = $request->validate([
            'nama'             => ['sometimes', 'string', 'max:255'],
            'alamat'           => ['sometimes', 'nullable', 'string'],
            'nama_kepsek'      => ['sometimes', 'nullable', 'string', 'max:255'],
            'nip_kepsek'       => ['sometimes', 'nullable', 'string', 'max:50'],
            'nama_universitas' => ['sometimes', 'nullable', 'string', 'max:255'],
        ]);

        $sekolah->update($data);

        return response()->json($sekolah);
    }

    public function destroy(Sekolah $sekolah): JsonResponse
    {
        $sekolah->delete();

        return response()->json(['message' => 'Sekolah berhasil dihapus.']);
    }

    private function generateUniqueAdminEmail(string $slug): string
    {
        $base = "admin.{$slug}@sertifikat.app";

        if (! User::where('email', $base)->exists()) {
            return $base;
        }

        $counter = 2;
        do {
            $email = "admin.{$slug}.{$counter}@sertifikat.app";
            $counter++;
        } while (User::where('email', $email)->exists());

        return $email;
    }
}
