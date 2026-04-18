<?php

namespace App\Jobs;

use App\Models\Sertifikat;
use App\Services\CertificateService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Foundation\Queue\Queueable;

class GenerateCertificateJob implements ShouldQueue
{
    use Queueable;

    public int $tries   = 3;
    public int $timeout = 120;

    public function __construct(public readonly int $sertifikatId) {}

    public function handle(CertificateService $service): void
    {
        $sertifikat = Sertifikat::find($this->sertifikatId);

        // Sertifikat sudah dihapus sebelum job diproses — abaikan saja
        if (! $sertifikat) {
            return;
        }

        $service->generate($sertifikat);
    }

    public function failed(\Throwable $exception): void
    {
        // Jika sertifikat sudah tidak ada, tidak perlu update status
        if ($exception instanceof ModelNotFoundException) {
            return;
        }

        Sertifikat::where('id', $this->sertifikatId)->update([
            'status'        => 'gagal',
            'error_message' => $exception->getMessage(),
        ]);
    }
}
