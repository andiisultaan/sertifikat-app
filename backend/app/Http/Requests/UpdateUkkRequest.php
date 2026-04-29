<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateUkkRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'sekolah_id'             => ['sometimes', 'nullable', 'exists:sekolah,id'],
            'nama'                   => ['sometimes', 'string', 'max:255'],
            'judul_pengujian'        => ['sometimes', 'nullable', 'string'],
            'jurusan'                => ['sometimes', 'string', 'max:100'],
            'tahun'                  => ['sometimes', 'integer', 'min:2000', 'max:2100'],
            'tanggal_mulai'          => ['sometimes', 'date'],
            'tanggal_selesai'        => ['sometimes', 'date', 'after_or_equal:tanggal_mulai'],
            'status'                 => ['sometimes', 'in:aktif,selesai'],
            'nama_sekolah'           => ['sometimes', 'nullable', 'string', 'max:255'],
            'alamat_sekolah'         => ['sometimes', 'nullable', 'string'],
            'nama_kepsek'            => ['sometimes', 'nullable', 'string', 'max:255'],
            'nip_kepsek'             => ['sometimes', 'nullable', 'string', 'max:30'],
            'nama_penguji_internal'  => ['sometimes', 'nullable', 'string', 'max:255'],
            'nama_penguji_external'  => ['sometimes', 'nullable', 'string', 'max:255'],
            'nama_universitas'       => ['sometimes', 'nullable', 'string', 'max:255'],
            'kompetensi'                    => ['sometimes', 'nullable', 'array'],
            'kompetensi.*.sub_judul'        => ['sometimes', 'nullable', 'string'],
            'kompetensi.*.items'            => ['sometimes', 'array'],
            'kompetensi.*.items.*.kode'     => ['sometimes', 'string'],
            'kompetensi.*.items.*.judul'    => ['sometimes', 'string'],
        ];
    }
}
