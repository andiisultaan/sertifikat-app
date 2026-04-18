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
            'nama'            => ['sometimes', 'string', 'max:255'],
            'jurusan'         => ['sometimes', 'string', 'max:100'],
            'tahun'           => ['sometimes', 'integer', 'min:2000', 'max:2100'],
            'tanggal_mulai'   => ['sometimes', 'date'],
            'tanggal_selesai' => ['sometimes', 'date', 'after_or_equal:tanggal_mulai'],
            'status'          => ['sometimes', 'in:aktif,selesai'],
        ];
    }
}
