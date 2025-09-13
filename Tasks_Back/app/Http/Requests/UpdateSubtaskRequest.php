<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateSubtaskRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'due_date' => 'sometimes|required|date',
            'priority' => 'sometimes|required|in:low,medium,high,critical',
            'is_complete' => 'sometimes|required|boolean',
            'task_id' => 'sometimes|required|exists:tasks,id',
        ];
    }
}
