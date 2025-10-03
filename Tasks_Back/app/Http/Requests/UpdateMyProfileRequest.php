<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateMyProfileRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'name'  => ['sometimes','required','string','max:255'],
            'email' => ['sometimes','required','email','max:255','unique:users,email,' . $this->user()->id],
            'avatar'=> ['sometimes','nullable','image','mimes:jpg,jpeg,png,webp','max:5200'],
        ];
    }
}
