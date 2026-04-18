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
            'nama'            => ['required', 'string', 'max:255'],
            'jurusan'         => ['required', 'string', 'max:100'],
            'tahun'           => ['required', 'integer', 'min:2000', 'max:2100'],
            'tanggal_mulai'   => ['required', 'date'],
            'tanggal_selesai' => ['required', 'date', 'after_or_equal:tanggal_mulai'],
            'status'          => ['sometimes', 'in:aktif,selesai'],
        ];
    }
}
