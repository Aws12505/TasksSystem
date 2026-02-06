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

            // External requester name (editable only for guest tickets)
            'requester_name' => 'sometimes|nullable|string|max:255',

            // ✅ Existing attachments to KEEP
            'keep_attachments'     => 'sometimes|array',
            'keep_attachments.*'   => 'integer|exists:attachments,id',

            // ✅ New attachments to upload
            'attachments'   => 'nullable|array',
            'attachments.*' => 'file|mimes:jpg,jpeg,png,pdf,doc,docx,csv,mp4,avi,xlsx,xls|max:5120', // 5MB
        ];
    }
}
