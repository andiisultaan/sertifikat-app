<?php

namespace App\Services;

class NilaiService
{
    /**
     * Hitung nilai akhir, status lulus, dan predikat
     * dari komponen nilai yang diberikan.
     *
     * @param  array<string, float>  $komponenNilai  Misal: ['nilai_teori' => 80, 'nilai_praktik' => 90, ...]
     */
    public function hitungNilaiAkhir(array $komponenNilai): array
    {
        $terisi = array_filter($komponenNilai, fn ($v) => $v !== null);

        if (empty($terisi)) {
            return [
                'nilai_akhir' => null,
                'status'      => null,
                'predikat'    => null,
            ];
        }

        $nilaiAkhir = array_sum($terisi) / count($terisi);
        $lulus = $nilaiAkhir >= 75;

        $predikat = match (true) {
            $nilaiAkhir >= 90 => 'A',
            $nilaiAkhir >= 80 => 'B',
            $nilaiAkhir >= 75 => 'C',
            default           => 'D',
        };

        return [
            'nilai_akhir' => round($nilaiAkhir, 2),
            'status'      => $lulus ? 'Lulus' : 'Tidak Lulus',
            'predikat'    => $predikat,
        ];
    }
}
