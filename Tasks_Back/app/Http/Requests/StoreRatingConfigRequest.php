<?php

namespace App\Http\Requests;

use App\Enums\RatingConfigType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;

class StoreRatingConfigRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => ['required', new Enum(RatingConfigType::class)],
            'config_data' => 'required|array',
            'is_active' => 'boolean',
        ];
    }
}
