<?php
// app/Http/Requests/EndBreakRequest.php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class EndBreakRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'description' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
