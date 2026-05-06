<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreSiswaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'sekolah_id'     => ['sometimes', 'nullable', 'exists:sekolah,id'],
            'nisn'           => ['required', 'string', 'max:20', 'unique:siswa,nisn'],
            'nama'           => ['required', 'string', 'max:255'],
            'tempat_lahir'   => ['required', 'string', 'max:100'],
            'tanggal_lahir'  => ['required', 'date'],
            'jenis_kelamin'  => ['required', 'in:L,P'],
            'jurusan'        => ['required', 'string', 'max:100'],
            'tahun_masuk'    => ['required', 'integer', 'min:2000', 'max:2100'],
        ];
    }
}
