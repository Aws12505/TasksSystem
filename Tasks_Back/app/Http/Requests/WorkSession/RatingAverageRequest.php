<?php

namespace App\Http\Requests\WorkSession;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class RatingAverageRequest extends FormRequest
{
    /** Longest month span the average endpoint accepts. */
    public const MAX_MONTHS = 60;

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'user_ids' => 'required|array|min:1|max:100',
            'user_ids.*' => 'integer|distinct|exists:users,id',
            'from' => 'required|array',
            'from.year' => 'required|integer|min:2020|max:2100',
            'from.month' => 'required|integer|min:1|max:12',
            'to' => 'required|array',
            'to.year' => 'required|integer|min:2020|max:2100',
            'to.month' => 'required|integer|min:1|max:12',
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            if ($validator->errors()->isNotEmpty()) {
                return;
            }

            $from = (int) $this->input('from.year') * 12 + (int) $this->input('from.month');
            $to = (int) $this->input('to.year') * 12 + (int) $this->input('to.month');

            if ($to < $from) {
                $validator->errors()->add('to', 'The "to" month must be the same as or after the "from" month.');

                return;
            }

            if (($to - $from + 1) > self::MAX_MONTHS) {
                $validator->errors()->add('to', 'The range may not span more than '.self::MAX_MONTHS.' months.');
            }
        });
    }
}
