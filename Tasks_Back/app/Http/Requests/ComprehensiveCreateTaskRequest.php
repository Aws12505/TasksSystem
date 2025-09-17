<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ComprehensiveCreateTaskRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            // Task fields
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'weight' => 'required|integer|min:1|max:100',
            'due_date' => 'required|date',
            'priority' => 'required|in:low,medium,high,critical',
            'section_id' => 'required|exists:sections,id',
            
            // Subtasks array
            'subtasks' => 'nullable|array',
            'subtasks.*.name' => 'required|string|max:255',
            'subtasks.*.description' => 'nullable|string',
            'subtasks.*.due_date' => 'required|date',
            'subtasks.*.priority' => 'required|in:low,medium,high,critical',
            
            // User assignments array
            'assignments' => 'nullable|array',
            'assignments.*.user_id' => 'required|exists:users,id',
            'assignments.*.percentage' => 'required|numeric|min:0.01|max:100',
        ];
    }

    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            $assignments = $this->input('assignments', []);
            if (!empty($assignments)) {
                $totalPercentage = array_sum(array_column($assignments, 'percentage'));
                if ($totalPercentage > 100) {
                    $validator->errors()->add('assignments', 'Total assignment percentage cannot exceed 100%');
                }
                
                $userIds = array_column($assignments, 'user_id');
                if (count($userIds) !== count(array_unique($userIds))) {
                    $validator->errors()->add('assignments', 'Cannot assign the same user multiple times');
                }
            }
        });
    }
}
