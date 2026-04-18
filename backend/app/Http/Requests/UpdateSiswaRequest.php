<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateSiswaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $siswaId = $this->route('siswa');

        return [
            'nis'            => ['sometimes', 'string', 'max:20', "unique:siswa,nis,{$siswaId}"],
            'nama'           => ['sometimes', 'string', 'max:255'],
            'tempat_lahir'   => ['sometimes', 'string', 'max:100'],
            'tanggal_lahir'  => ['sometimes', 'date'],
            'jenis_kelamin'  => ['sometimes', 'in:L,P'],
            'jurusan'        => ['sometimes', 'string', 'max:100'],
            'tahun_masuk'    => ['sometimes', 'integer', 'min:2000', 'max:2100'],
        ];
    }
}
