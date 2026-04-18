<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateNilaiRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nilai_teori'      => ['sometimes', 'nullable', 'numeric', 'min:0', 'max:100'],
            'nilai_praktik'    => ['sometimes', 'nullable', 'numeric', 'min:0', 'max:100'],
            'nilai_portofolio' => ['sometimes', 'nullable', 'numeric', 'min:0', 'max:100'],
        ];
    }
}
