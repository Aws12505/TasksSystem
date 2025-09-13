<?php

namespace App\Http\Requests;

use App\Enums\HelpRequestRating;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;

class CompleteHelpRequestRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'rating' => ['required', new Enum(HelpRequestRating::class)],
        ];
    }
}
