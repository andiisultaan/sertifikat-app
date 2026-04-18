<?php

namespace App\Services;

use App\Models\Sertifikat;
use App\Models\TemplateSertifikat;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class CertificateService
{
    /**
     * Generate PDF sertifikat dari record Sertifikat yang sudah ada.
     * Menyimpan file ke storage dan update status.
     */
    public function generate(Sertifikat $sertifikat): Sertifikat
    {
        $sertifikat->update(['status' => 'processing']);

        try {
            $nilai  = $sertifikat->nilai->load(['siswa', 'ukk']);
            $siswa  = $nilai->siswa;
            $ukk    = $nilai->ukk;

            $data = [
                'nama'                   => $siswa->nama,
                'nis'                    => $siswa->nis,
                'jurusan'                => $siswa->jurusan,
                'tempat_lahir'           => $siswa->tempat_lahir,
                'nama_ukk'               => $ukk->nama,
                'judul_pengujian'        => $ukk->judul_pengujian,
                'tahun'                  => $ukk->tahun,
                'nilai_akhir'            => $nilai->nilai_akhir,
                'predikat'               => $nilai->predikat,
                'status'                 => $nilai->status,
                'nomor_sertifikat'       => $sertifikat->nomor_sertifikat,
                'tanggal_terbit'         => now()->toDateString(),
                'kompetensi'             => $ukk->kompetensi ?? [],
                'nama_sekolah'           => $ukk->nama_sekolah,
                'alamat_sekolah'         => $ukk->alamat_sekolah,
                'nama_kepsek'            => $ukk->nama_kepsek,
                'nip_kepsek'             => $ukk->nip_kepsek,
                'nama_penguji_internal'  => $ukk->nama_penguji_internal,
                'nama_penguji_external'  => $ukk->nama_penguji_external,
                'nama_universitas'       => $ukk->nama_universitas,
            ];

            $pdf = Pdf::loadView('certificate.template', $data)
                ->setPaper('a4', 'landscape');

            $safeNomor = str_replace('/', '-', $sertifikat->nomor_sertifikat);
            $fileName  = 'sertifikat/' . Str::slug($siswa->nama) . '-' . $safeNomor . '.pdf';
            $pdfOutput = $pdf->output();

            Storage::disk('public')->put($fileName, $pdfOutput);

            $sertifikat->update([
                'status'       => 'selesai',
                'file_path'    => $fileName,
                'generated_at' => now(),
            ]);
        } catch (\Throwable $e) {
            $sertifikat->update([
                'status'        => 'gagal',
                'error_message' => $e->getMessage(),
            ]);

            throw $e;
        }

        return $sertifikat->fresh();
    }

    /**
     * Buat record Sertifikat baru lalu generate PDF-nya.
     */
    public function createAndGenerate(int $nilaiId): Sertifikat
    {
        $template = TemplateSertifikat::where('is_default', true)->firstOrFail();

        $sertifikat = Sertifikat::create([
            'nilai_id'         => $nilaiId,
            'template_id'      => $template->id,
            'nomor_sertifikat' => $this->generateNomor(),
            'status'           => 'pending',
        ]);

        return $this->generate($sertifikat);
    }

    private function generateNomor(): string
    {
        $tahun  = now()->format('Y');
        $urutan = str_pad(Sertifikat::whereYear('created_at', $tahun)->count() + 1, 4, '0', STR_PAD_LEFT);

        return "SKT/{$tahun}/{$urutan}";
    }
}
