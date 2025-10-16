<?php
// app/Http/Requests/ExportClockingsRequest.php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ExportClockingsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
        ];
    }
}
