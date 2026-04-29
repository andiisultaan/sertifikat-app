<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreUkkRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'sekolah_id'      => ['sometimes', 'nullable', 'exists:sekolah,id'],
            'nama'            => ['required', 'string', 'max:255'],
            'jurusan'         => ['required', 'string', 'max:100'],
            'tahun'           => ['required', 'integer', 'min:2000', 'max:2100'],
            'tanggal_mulai'   => ['required', 'date'],
            'tanggal_selesai' => ['required', 'date', 'after_or_equal:tanggal_mulai'],
            'status'          => ['sometimes', 'in:aktif,selesai'],
            'kompetensi'                    => ['sometimes', 'nullable', 'array'],
            'kompetensi.*.sub_judul'        => ['sometimes', 'nullable', 'string'],
            'kompetensi.*.items'            => ['sometimes', 'array'],
            'kompetensi.*.items.*.kode'     => ['sometimes', 'string'],
            'kompetensi.*.items.*.judul'    => ['sometimes', 'string'],
            'judul_pengujian'        => ['sometimes', 'nullable', 'string'],
            'nama_sekolah'           => ['sometimes', 'nullable', 'string', 'max:255'],
            'alamat_sekolah'         => ['sometimes', 'nullable', 'string'],
            'nama_kepsek'            => ['sometimes', 'nullable', 'string', 'max:255'],
            'nip_kepsek'             => ['sometimes', 'nullable', 'string', 'max:30'],
            'nama_penguji_internal'  => ['sometimes', 'nullable', 'string', 'max:255'],
            'nama_penguji_external'  => ['sometimes', 'nullable', 'string', 'max:255'],
            'nama_universitas'       => ['sometimes', 'nullable', 'string', 'max:255'],
        ];
    }
}
