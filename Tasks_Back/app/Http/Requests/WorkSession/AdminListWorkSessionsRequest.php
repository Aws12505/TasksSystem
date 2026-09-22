<?php

namespace App\Http\Requests\WorkSession;

use Illuminate\Foundation\Http\FormRequest;

class AdminListWorkSessionsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'user_ids' => 'nullable|array',
            'user_ids.*' => 'integer|exists:users,id',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'status' => 'nullable|string|in:open,confirmed',
            'per_page' => 'nullable|integer|min:1|max:100',
            'page' => 'nullable|integer|min:1',
        ];
    }
}
