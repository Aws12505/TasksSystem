<?php

namespace App\Http\Requests\WorkSession;

use Illuminate\Foundation\Http\FormRequest;

class AssignableTasksRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'search' => 'nullable|string|max:100',
        ];
    }
}
