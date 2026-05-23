<?php

namespace App\Http\Requests\AI;

use Illuminate\Foundation\Http\FormRequest;

class QueryOracleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'repository_id' => ['required', 'integer', 'exists:repositories,id'],
            'question' => ['required', 'string', 'min:3', 'max:500'],
            'context' => ['nullable', 'string', 'max:2000'],
        ];
    }
}
