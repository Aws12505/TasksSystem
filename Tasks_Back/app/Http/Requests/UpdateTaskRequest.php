<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTaskRequest extends FormRequest
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
            'weight' => 'sometimes|required|integer|min:1',
            'due_date' => 'sometimes|required|date',
            'priority' => 'sometimes|required|in:low,medium,high,critical',
            'status' => 'sometimes|required|in:pending,in_progress,done,rated',
            'section_id' => 'sometimes|required|exists:sections,id',
        ];
    }
}
