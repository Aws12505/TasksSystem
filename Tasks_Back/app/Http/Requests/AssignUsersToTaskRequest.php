<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AssignUsersToTaskRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'assignments' => 'required|array',
            'assignments.*.user_id' => 'required|exists:users,id',
            'assignments.*.percentage' => 'required|numeric|min:0.01|max:100',
        ];
    }

    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            $assignments = $this->input('assignments', []);
            $totalPercentage = array_sum(array_column($assignments, 'percentage'));
            
            if ($totalPercentage > 100) {
                $validator->errors()->add('assignments', 'Total percentage cannot exceed 100%');
            }

            // Check for duplicate user assignments
            $userIds = array_column($assignments, 'user_id');
            if (count($userIds) !== count(array_unique($userIds))) {
                $validator->errors()->add('assignments', 'Cannot assign the same user multiple times');
            }
        });
    }
}
