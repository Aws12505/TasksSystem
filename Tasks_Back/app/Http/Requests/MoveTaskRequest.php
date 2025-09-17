<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class MoveTaskRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'section_id' => 'sometimes|exists:sections,id',
            'status' => 'sometimes|in:pending,in_progress,done,rated',
        ];
    }
}
