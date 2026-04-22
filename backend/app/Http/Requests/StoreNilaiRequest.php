<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreNilaiRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'siswa_id'        => ['required', 'exists:siswa,id'],
            'ukk_id'          => ['required', 'exists:ukk,id'],
            'nilai_internal'  => ['nullable', 'numeric', 'min:0', 'max:100'],
            'nilai_eksternal' => ['nullable', 'numeric', 'min:0', 'max:100'],
        ];
    }
}
