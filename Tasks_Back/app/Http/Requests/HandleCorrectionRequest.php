<?php
// app/Http/Requests/HandleCorrectionRequest.php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class HandleCorrectionRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'action' => ['required', 'in:approve,reject'],
            'admin_notes' => ['nullable', 'string', 'max:500'],
        ];
    }
}
