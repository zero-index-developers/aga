<?php

namespace App\Http\Requests\Repository;

use Illuminate\Foundation\Http\FormRequest;

class ConnectDashboardRepositoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'url' => ['required', 'string', 'max:2048'],
            'repoName' => ['nullable', 'string', 'max:255'],
            'provider' => ['nullable', 'string', 'max:50'],
            'token' => ['nullable', 'string'],
        ];
    }
}
