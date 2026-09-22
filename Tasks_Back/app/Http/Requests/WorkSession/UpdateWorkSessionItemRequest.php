<?php

namespace App\Http\Requests\WorkSession;

use Illuminate\Foundation\Http\FormRequest;

class UpdateWorkSessionItemRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => 'sometimes|required|string|max:255',
            'description' => 'sometimes|nullable|string|max:5000',
            'priority' => 'sometimes|string|in:low,medium,high,critical',
            'estimated_minutes' => 'sometimes|nullable|integer|min:1|max:1440',
            'task_id' => 'sometimes|nullable|integer|exists:tasks,id',
        ];
    }
}
