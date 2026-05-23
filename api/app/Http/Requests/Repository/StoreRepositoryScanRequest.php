<?php

namespace App\Http\Requests\Repository;

use Illuminate\Foundation\Http\FormRequest;

class StoreRepositoryScanRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'url' => ['nullable', 'string', 'max:2048'],
            'provider' => ['nullable', 'string', 'max:50'],
            'graph' => ['required', 'array'],
            'graph.nodes' => ['nullable', 'array'],
            'graph.edges' => ['nullable', 'array'],
            'analytics' => ['required', 'array'],
            'analytics.nodes' => ['required', 'integer', 'min:0'],
            'analytics.edges' => ['required', 'integer', 'min:0'],
            'analytics.health' => ['required', 'integer', 'min:0', 'max:100'],
            'analytics.lastScanned' => ['required', 'date'],
            'duration' => ['nullable', 'string', 'max:50'],
            'message' => ['nullable', 'string'],
            'status' => ['nullable', 'string', 'max:50'],
        ];
    }
}
