<?php

namespace App\Http\Controllers;

use App\Models\Sekolah;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\UploadedFile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class SekolahController extends Controller
{
    private const AUTO_ROLES = ['admin', 'penguji_internal', 'penguji_external'];

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

            $accounts = [];
            foreach (self::AUTO_ROLES as $role) {
                $email = $this->generateUniqueEmail($role, $slug);
                $password = Str::random(12);

                $user = User::create([
                    'name'       => $this->defaultNameForRole($role, $sekolah->nama),
                    'email'      => $email,
                    'password'   => Hash::make($password),
                    'role'       => $role,
                    'sekolah_id' => $sekolah->id,
                ]);

                $accounts[$role] = [
                    'id'       => $user->id,
                    'name'     => $user->name,
                    'email'    => $user->email,
                    'password' => $password,
                ];
            }

            $result = [
                'sekolah' => $sekolah,
                'accounts' => $accounts,
                // Keep this key for backward compatibility with existing frontend flow.
                'admin' => $accounts['admin'],
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
            'nama'                => ['sometimes', 'string', 'max:255'],
            'alamat'              => ['sometimes', 'nullable', 'string'],
            'nama_kepsek'         => ['sometimes', 'nullable', 'string', 'max:255'],
            'nip_kepsek'          => ['sometimes', 'nullable', 'string', 'max:50'],
            'nama_universitas'    => ['sometimes', 'nullable', 'string', 'max:255'],
            'logo'                => ['sometimes', 'nullable', 'file', 'image', 'mimes:jpeg,jpg,png,webp', 'max:5120'],
            'background_template' => ['sometimes', 'nullable', 'file', 'image', 'mimes:jpeg,jpg,png,webp', 'max:8192'],
            'remove_logo'         => ['sometimes', 'boolean'],
            'remove_background'   => ['sometimes', 'boolean'],
        ]);

        if ($request->boolean('remove_logo') && $sekolah->logo_path) {
            Storage::disk('public')->delete($sekolah->logo_path);
            $data['logo_path'] = null;
        } elseif ($request->hasFile('logo')) {
            $data['logo_path'] = $this->storeImage(
                file: $request->file('logo'),
                targetDir: 'sekolah/logo',
                schoolName: $sekolah->nama,
                oldPath: $sekolah->logo_path
            );
        }

        if ($request->boolean('remove_background') && $sekolah->background_template_path) {
            Storage::disk('public')->delete($sekolah->background_template_path);
            $data['background_template_path'] = null;
        } elseif ($request->hasFile('background_template')) {
            $data['background_template_path'] = $this->storeImage(
                file: $request->file('background_template'),
                targetDir: 'sekolah/background',
                schoolName: $sekolah->nama,
                oldPath: $sekolah->background_template_path
            );
        }

        $sekolah->update($data);

        return response()->json($sekolah);
    }

    public function destroy(Sekolah $sekolah): JsonResponse
    {
        $sekolah->delete();

        return response()->json(['message' => 'Sekolah berhasil dihapus.']);
    }

    private function generateUniqueEmail(string $role, string $slug): string
    {
        $base = "{$role}.{$slug}@sertifikat.app";

        if (! User::where('email', $base)->exists()) {
            return $base;
        }

        $counter = 2;
        do {
            $email = "{$role}.{$slug}.{$counter}@sertifikat.app";
            $counter++;
        } while (User::where('email', $email)->exists());

        return $email;
    }

    private function defaultNameForRole(string $role, string $schoolName): string
    {
        return match ($role) {
            'admin' => 'Admin ' . $schoolName,
            'penguji_internal' => 'Penguji Internal ' . $schoolName,
            'penguji_external' => 'Penguji External ' . $schoolName,
            default => ucfirst(str_replace('_', ' ', $role)) . ' ' . $schoolName,
        };
    }

    private function storeImage(UploadedFile $file, string $targetDir, string $schoolName, ?string $oldPath = null): string
    {
        $ext = strtolower($file->getClientOriginalExtension() ?: ($file->guessExtension() ?: 'jpg'));
        $fileName = Str::slug($schoolName) . '-' . Str::lower(Str::random(12)) . '.' . $ext;
        $relativePath = trim($targetDir, '/') . '/' . $fileName;

        Storage::disk('public')->put($relativePath, file_get_contents($file->getRealPath()));

        if ($oldPath && Storage::disk('public')->exists($oldPath)) {
            Storage::disk('public')->delete($oldPath);
        }

        return $relativePath;
    }
}
