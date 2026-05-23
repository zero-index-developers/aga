<?php

namespace App\Http\Requests\Logs;

use Illuminate\Foundation\Http\FormRequest;

class DestroyAiHistoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'ids' => ['required', 'array'],
            'ids.*' => ['string'],
        ];
    }
}
