<?php

namespace App\Http\Requests;

use App\Enums\TicketType;
use App\Enums\TicketStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;

class UpdateTicketRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title'        => 'sometimes|required|string|max:255',
            'description'  => 'sometimes|required|string',
            'type'         => ['sometimes', 'required', new Enum(TicketType::class)],
            'priority'     => 'sometimes|required|in:low,medium,high,critical',
            'status'       => ['sometimes', 'required', new Enum(TicketStatus::class)],
            'assigned_to'  => 'nullable|exists:users,id',

            // Do NOT accept requester_id changes from client
            'requester_name' => 'sometimes|nullable|string|max:255',
        ];
    }
}
