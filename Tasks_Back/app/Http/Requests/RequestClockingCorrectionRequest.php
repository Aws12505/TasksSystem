<?php
// app/Http/Requests/RequestClockingCorrectionRequest.php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RequestClockingCorrectionRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'clock_session_id' => ['nullable', 'integer', 'exists:clock_sessions,id'],
            'break_record_id' => ['nullable', 'integer', 'exists:break_records,id'],
            'correction_type' => ['required', 'in:clock_in,clock_out,break_in,break_out'],
            'requested_time_utc' => ['required', 'date_format:Y-m-d\TH:i:s\Z'], // FIXED FORMAT
            'reason' => ['required', 'string', 'min:10', 'max:500'],
        ];
    }
}
