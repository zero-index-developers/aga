<?php

namespace App\Http\Requests\Repository;

use Illuminate\Foundation\Http\FormRequest;

class ConnectRepositoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'url' => ['required', 'string'],
        ];
    }
}
