<?php
// app/Http/Requests/DirectEditClockSessionRequest.php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class DirectEditClockSessionRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'clock_in_utc' => ['nullable', 'date_format:Y-m-d\TH:i:s\Z'],
            'clock_out_utc' => ['nullable', 'date_format:Y-m-d\TH:i:s\Z'],
        ];
    }
}
