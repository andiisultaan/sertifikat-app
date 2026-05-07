<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rules\Password;

class UserController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = User::with('sekolah')->orderBy('name');

        if ($request->has('search') && $request->get('search') !== '') {
            $search = $request->get('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($request->boolean('paginate', false)) {
            return response()->json($query->paginate($request->integer('per_page', 20)));
        }

        return response()->json($query->get());
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'     => ['required', 'string', 'max:255'],
            'email'    => ['required', 'email', 'unique:users,email'],
            'password' => ['required', Password::min(8)],
            'role'     => ['required', 'in:super_admin,admin,penguji_internal,penguji_external'],
        ]);

        $user = User::create($data);

        return response()->json($user, 201);
    }

    public function show(User $user): JsonResponse
    {
        return response()->json($user->load('sekolah'));
    }

    public function update(Request $request, User $user): JsonResponse
    {
        $data = $request->validate([
            'name'     => ['sometimes', 'string', 'max:255'],
            'email'    => ['sometimes', 'email', 'unique:users,email,' . $user->id],
            'password' => ['sometimes', 'nullable', Password::min(8)],
            'role'     => ['sometimes', 'in:super_admin,admin,penguji_internal,penguji_external'],
        ]);

        if (isset($data['password']) && $data['password'] === null) {
            unset($data['password']);
        }

        $user->update($data);

        return response()->json($user->fresh('sekolah'));
    }

    public function destroy(User $user): JsonResponse
    {
        // Tidak boleh hapus diri sendiri
        if ($user->id === Auth::id()) {
            return response()->json(['message' => 'Tidak dapat menghapus akun sendiri.'], 422);
        }

        $user->delete();

        return response()->json(['message' => 'User berhasil dihapus.']);
    }
}
