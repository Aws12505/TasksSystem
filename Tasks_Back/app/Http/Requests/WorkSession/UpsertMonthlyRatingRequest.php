<?php

namespace App\Http\Requests\WorkSession;

use Illuminate\Foundation\Http\FormRequest;

class UpsertMonthlyRatingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'score' => 'required|numeric|min:0|max:100',
            'comment' => 'nullable|string|max:2000',
        ];
    }
}
