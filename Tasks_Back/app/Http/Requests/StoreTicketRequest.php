<?php

namespace App\Http\Requests;

use App\Enums\TicketType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class StoreTicketRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title'        => 'required|string|max:255',
            'description'  => 'required|string',
            'type'         => ['required', new Enum(TicketType::class)],
            'priority'     => 'required|in:low,medium,high,critical',
            'assigned_to'  => 'nullable|exists:users,id',

            // No requester_id from client
            // requester_name is required ONLY if user is not authenticated
            'requester_name' => [
                'nullable',
                'string',
                'max:255',
                Rule::requiredIf(fn () => !Auth::check()),
            ],
        ];
    }
}
