<?php

namespace App\Http\Requests;

use App\Enums\RatingConfigType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;

class UpdateRatingConfigRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'type' => ['sometimes', 'required', new Enum(RatingConfigType::class)],
            'config_data' => 'sometimes|required|array',
            'is_active' => 'boolean',
        ];
    }
}
