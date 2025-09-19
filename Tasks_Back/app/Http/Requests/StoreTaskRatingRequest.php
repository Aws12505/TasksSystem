<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreTaskRatingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'task_id' => 'required|exists:tasks,id',
'rating_config_id' => [
  'required',
  Rule::exists('rating_configs', 'id')->where('type', 'task_rating'),
],
            'rating_data' => 'required|array',
            'rating_data.*' => 'required|numeric|min:0',
        ];
    }
}
