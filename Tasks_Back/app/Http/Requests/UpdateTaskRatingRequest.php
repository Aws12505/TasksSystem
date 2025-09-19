<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateTaskRatingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
'rating_config_id' => [
  'sometimes',
  Rule::exists('rating_configs', 'id')->where('type', 'task_rating'),
],            'rating_data' => 'sometimes|required|array',
            'rating_data.*' => 'required|numeric|min:0',
        ];
    }
}
