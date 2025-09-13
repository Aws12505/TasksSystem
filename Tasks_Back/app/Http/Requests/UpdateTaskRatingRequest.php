<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTaskRatingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'rating_data' => 'sometimes|required|array',
            'rating_data.*' => 'required|numeric|min:0',
        ];
    }
}
