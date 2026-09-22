<?php

namespace App\Http\Requests\WorkSession;

use Illuminate\Foundation\Http\FormRequest;

class StoreWorkSessionItemRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:5000',
            'priority' => 'nullable|string|in:low,medium,high,critical',
            'estimated_minutes' => 'nullable|integer|min:1|max:1440',
            'task_id' => 'nullable|integer|exists:tasks,id',
        ];
    }
}
