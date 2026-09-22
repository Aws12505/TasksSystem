<?php

namespace App\Http\Requests\WorkSession;

use Illuminate\Foundation\Http\FormRequest;

class ExportMonthlyPdfRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'user_ids' => 'required|array|min:1|max:100',
            'user_ids.*' => 'integer|distinct|exists:users,id',
            'year' => 'required|integer|min:2020|max:2100',
            'month' => 'required|integer|min:1|max:12',
        ];
    }
}
