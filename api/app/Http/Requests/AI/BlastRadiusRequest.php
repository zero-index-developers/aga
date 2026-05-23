<?php

namespace App\Http\Requests\AI;

use Illuminate\Foundation\Http\FormRequest;

class BlastRadiusRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'node_id' => ['required', 'string'],
            'repository_id' => ['required', 'integer', 'exists:repositories,id'],
        ];
    }
}
