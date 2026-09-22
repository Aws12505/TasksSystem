<?php

namespace App\Http\Requests\WorkSession;

use Illuminate\Foundation\Http\FormRequest;

class StartWorkSessionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'carry_over_item_ids' => 'nullable|array|max:100',
            'carry_over_item_ids.*' => 'integer|distinct|exists:work_session_items,id',
        ];
    }
}
