<?php

namespace App\Http\Requests\WorkSession;

use Illuminate\Foundation\Http\FormRequest;

class ConfirmWorkSessionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'items' => 'required|array|min:1',
            'items.*.id' => 'required|integer',
            'items.*.outcome' => 'required|string|in:done,partial,not_done',
            'items.*.outcome_note' => 'nullable|string|max:2000',
            'summary_note' => 'nullable|string|max:5000',
        ];
    }
}
