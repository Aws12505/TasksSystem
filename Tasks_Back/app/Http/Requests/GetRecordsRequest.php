<?php
// app/Http/Requests/GetRecordsRequest.php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class GetRecordsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'user_id' => ['nullable', 'integer', 'exists:users,id'],
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            'status' => ['nullable', 'string', 'in:active,on_break,completed'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ];
    }
}
