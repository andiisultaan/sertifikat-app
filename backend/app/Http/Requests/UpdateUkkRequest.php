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
            'kompetensi'                                        => ['sometimes', 'nullable', 'array'],
            'kompetensi.utama'                                  => ['sometimes', 'array'],
            'kompetensi.utama.perencanaan_persiapan'            => ['sometimes', 'array'],
            'kompetensi.utama.perencanaan_persiapan.*.kode'     => ['sometimes', 'string'],
            'kompetensi.utama.perencanaan_persiapan.*.judul'    => ['sometimes', 'string'],
            'kompetensi.utama.implementasi'                     => ['sometimes', 'array'],
            'kompetensi.utama.implementasi.*.kode'              => ['sometimes', 'string'],
            'kompetensi.utama.implementasi.*.judul'             => ['sometimes', 'string'],
            'kompetensi.utama.pengujian_dokumentasi'            => ['sometimes', 'array'],
            'kompetensi.utama.pengujian_dokumentasi.*.kode'     => ['sometimes', 'string'],
            'kompetensi.utama.pengujian_dokumentasi.*.judul'    => ['sometimes', 'string'],
            'kompetensi.pendukung'                              => ['sometimes', 'array'],
            'kompetensi.pendukung.*.kode'                       => ['sometimes', 'string'],
            'kompetensi.pendukung.*.judul'                      => ['sometimes', 'string'],
        ];
    }
}
