<?php

namespace App\Http\Requests\WorkSession;

use Illuminate\Foundation\Http\FormRequest;

class OverviewReportRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'user_ids' => 'nullable|array|max:100',
            'user_ids.*' => 'integer|distinct|exists:users,id',
            'include_open' => 'nullable|boolean',
        ];
    }
}
