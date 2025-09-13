<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreHelpRequestRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'description' => 'required|string',
            'task_id' => 'required|exists:tasks,id',
            'helper_id' => 'nullable|exists:users,id', // For direct assignment
        ];
    }
}
