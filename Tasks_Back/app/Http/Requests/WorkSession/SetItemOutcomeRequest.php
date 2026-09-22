<?php

namespace App\Http\Requests\WorkSession;

use Illuminate\Foundation\Http\FormRequest;

class SetItemOutcomeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'outcome' => 'required|string|in:pending,done,partial,not_done',
            'outcome_note' => 'nullable|string|max:2000',
        ];
    }
}
