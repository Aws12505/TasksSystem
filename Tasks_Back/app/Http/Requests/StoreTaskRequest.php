<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTaskRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'weight' => 'required|integer|min:1',
            'due_date' => 'required|date',
            'priority' => 'required|in:low,medium,high,critical',
            'section_id' => 'required|exists:sections,id',
        ];
    }
}
