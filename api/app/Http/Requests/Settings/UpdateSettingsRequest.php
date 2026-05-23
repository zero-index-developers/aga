<?php

namespace App\Http\Requests\Settings;

use Illuminate\Foundation\Http\FormRequest;

class UpdateSettingsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'scanner' => ['nullable', 'array'],
            'scanner.exclusions' => ['nullable', 'array'],
            'scanner.exclusions.*' => ['string'],
            'ai' => ['nullable', 'array'],
            'ai.insightDepth' => ['nullable', 'in:concise,detailed'],
            'ai.focus' => ['nullable', 'in:architecture,security,performance'],
        ];
    }
}
