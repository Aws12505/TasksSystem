<?php
// app/Http/Requests/DirectEditBreakRecordRequest.php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class DirectEditBreakRecordRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'break_start_utc' => ['nullable', 'date_format:Y-m-d\TH:i:s\Z'],
            'break_end_utc' => ['nullable', 'date_format:Y-m-d\TH:i:s\Z'],
        ];
    }
}
