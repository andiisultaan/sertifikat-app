<?php

namespace App\Http\Controllers;

use App\Models\Sekolah;
use App\Services\DigitalSignatureService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SignatureKeyController extends Controller
{
    public function __construct(
        private readonly DigitalSignatureService $sigService,
    ) {}

    /**
     * GET /sekolah/{sekolah}/signature-key
     * Cek status key tanda tangan digital untuk semua role
     */
    public function status(Sekolah $sekolah): JsonResponse
    {
        $roles   = ['kepsek', 'penguji_eksternal'];
        $result  = [];

        foreach ($roles as $role) {
            $hasKey = $this->sigService->hasPrivateKey($sekolah, $role);
            $result[$role] = [
                'has_key' => $hasKey,
                'message' => $hasKey
                    ? 'Key tersedia.'
                    : 'Key belum dibuat.',
            ];
        }

        return response()->json([
            'sekolah_id' => $sekolah->id,
            'keys'       => $result,
        ]);
    }

    /**
     * POST /sekolah/{sekolah}/signature-key/generate
     * Generate RSA key pair untuk role tertentu (kepsek|penguji_eksternal)
     */
    public function generate(Request $request, Sekolah $sekolah): JsonResponse
    {
        $role  = $request->input('role', 'kepsek');
        $force = (bool) $request->input('force', false);

        if (! in_array($role, ['kepsek', 'penguji_eksternal'], true)) {
            return response()->json([
                'success' => false,
                'message' => 'Role tidak valid. Gunakan kepsek atau penguji_eksternal.',
            ], 422);
        }

        $hasKey = $this->sigService->hasPrivateKey($sekolah, $role);

        if ($hasKey && ! $force) {
            return response()->json([
                'success' => false,
                'message' => "Key untuk {$role} sudah ada. Kirim `force: true` untuk membuat ulang.",
            ], 422);
        }

        try {
            $this->sigService->generateKeys($sekolah, $role);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal membuat key: ' . $e->getMessage(),
            ], 500);
        }

        return response()->json([
            'success' => true,
            'message' => "RSA-2048 key pair untuk {$role} berhasil dibuat.",
        ]);
    }
}
