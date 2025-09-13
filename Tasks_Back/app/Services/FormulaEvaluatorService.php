<?php

namespace App\Services;

use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class FormulaEvaluatorService
{
    private array $variables = [];
    private array $calculationSteps = [];

    public function evaluate(string $expression, array $variableDefinitions, int $userId, Carbon $periodStart, Carbon $periodEnd): float
    {
        $this->calculationSteps = [];
        $this->variables = [];

        // Load variable values scoped to user and period
        foreach ($variableDefinitions as $variable) {
            $this->variables[$variable['name']] = $this->getVariableValue($variable, $userId, $periodStart, $periodEnd);
        }

        // Evaluate the expression with loaded variables
        $result = $this->evaluateExpression($expression);

        return $result;
    }

    public function getCalculationSteps(): array
    {
        return $this->calculationSteps;
    }

    public function getVariables(): array
    {
        return $this->variables;
    }

    private function evaluateExpression(string $expression): float
    {
        // Handle nested parentheses by recursively evaluating inner expressions
        while (preg_match('/\(([^()]+)\)/', $expression, $matches)) {
            $innerExpression = $matches[1];
            $innerResult = $this->evaluateSimpleExpression($innerExpression);
            $expression = str_replace($matches[0], (string)$innerResult, $expression);
            
            $this->calculationSteps[] = [
                'expression' => $matches[0],
                'result' => $innerResult,
                'type' => 'parentheses_evaluation'
            ];
        }

        // Evaluate the final expression
        return $this->evaluateSimpleExpression($expression);
    }

    private function evaluateSimpleExpression(string $expression): float
    {
        // Replace variables with their values
        foreach ($this->variables as $varName => $varValue) {
            $expression = str_replace($varName, (string)$varValue, $expression);
        }

        // Handle functions first (avg, sum, count, etc.)
        $expression = $this->evaluateFunctions($expression);

        // Handle mathematical operations with proper precedence
        return $this->evaluateMathExpression($expression);
    }

    private function evaluateFunctions(string $expression): string
    {
        // Handle function calls like avg(task_ratings), sum(weights), etc.
        $pattern = '/(\w+)\(([^)]+)\)/';
        
        while (preg_match($pattern, $expression, $matches)) {
            $function = $matches[1];
            $argument = $matches[2];
            
            $result = match($function) {
                'avg', 'average' => $this->evaluateAverage($argument),
                'sum' => $this->evaluateSum($argument),
                'count' => $this->evaluateCount($argument),
                'min' => $this->evaluateMin($argument),
                'max' => $this->evaluateMax($argument),
                'sqrt' => sqrt($this->evaluateMathExpression($argument)),
                'abs' => abs($this->evaluateMathExpression($argument)),
                default => 0
            };

            $this->calculationSteps[] = [
                'function' => $function,
                'argument' => $argument,
                'result' => $result,
                'type' => 'function_evaluation'
            ];

            $expression = str_replace($matches[0], (string)$result, $expression);
        }

        return $expression;
    }

    private function evaluateMathExpression(string $expression): float
    {
        // Remove spaces
        $expression = str_replace(' ', '', $expression);

        // If it's just a number, return it
        if (is_numeric($expression)) {
            return floatval($expression);
        }

        // Handle multiplication and division first (higher precedence)
        while (preg_match('/(-?\d*\.?\d+)\s*([*\/])\s*(-?\d*\.?\d+)/', $expression, $matches)) {
            $left = floatval($matches[1]);
            $operator = $matches[2];
            $right = floatval($matches[3]);

            $result = match($operator) {
                '*' => $left * $right,
                '/' => $right != 0 ? $left / $right : 0,
                default => 0
            };

            $expression = str_replace($matches[0], (string)$result, $expression);
        }

        // Handle addition and subtraction (lower precedence)
        while (preg_match('/(-?\d*\.?\d+)\s*([+\-])\s*(-?\d*\.?\d+)/', $expression, $matches)) {
            $left = floatval($matches[1]);
            $operator = $matches[2];
            $right = floatval($matches[3]);

            $result = match($operator) {
                '+' => $left + $right,
                '-' => $left - $right,
                default => 0
            };

            $expression = str_replace($matches[0], (string)$result, $expression);
        }

        return floatval($expression);
    }

    private function getVariableValue(array $variable, int $userId, Carbon $periodStart, Carbon $periodEnd): float
    {
        $model = $variable['model'];
        $column = $variable['column'];
        $operation = $variable['operation'] ?? 'avg';
        $conditions = $variable['conditions'] ?? [];

        $modelClass = "App\\Models\\{$model}";
        
        if (!class_exists($modelClass)) {
            return 0;
        }

        $query = $modelClass::query();

        // Apply user scoping automatically
        $this->applyUserScoping($query, $modelClass, $userId);

        // Apply period filtering
        $query->whereBetween('created_at', [$periodStart, $periodEnd]);

        // Apply additional conditions
        foreach ($conditions as $condition) {
            $query->where($condition['column'], $condition['operator'], $condition['value']);
        }

        // Execute the operation
        $result = match($operation) {
            'sum' => $query->sum($column),
            'avg', 'average' => $query->avg($column) ?? 0,
            'count' => $query->count(),
            'min' => $query->min($column) ?? 0,
            'max' => $query->max($column) ?? 0,
            default => $query->value($column) ?? 0,
        };

        $this->calculationSteps[] = [
            'variable' => $variable['name'],
            'model' => $model,
            'column' => $column,
            'operation' => $operation,
            'result' => $result,
            'type' => 'variable_calculation'
        ];

        return floatval($result);
    }

    private function applyUserScoping($query, string $modelClass, int $userId): void
    {
        // Automatically scope data to the user based on model structure
        if (method_exists($modelClass, 'getFillable')) {
            $fillable = (new $modelClass)->getFillable();
            
            if (in_array('user_id', $fillable)) {
                $query->where('user_id', $userId);
            } elseif (in_array('rater_id', $fillable)) {
                $query->where('rater_id', $userId);
            } elseif (in_array('stakeholder_id', $fillable)) {
                $query->where('stakeholder_id', $userId);
            } elseif (in_array('assigned_to', $fillable)) {
                $query->where('assigned_to', $userId);
            } elseif (in_array('helper_id', $fillable)) {
                $query->where('helper_id', $userId);
            }
            // Add more scoping rules as needed for your models
        }
    }

    private function evaluateAverage(string $argument): float
    {
        if (isset($this->variables[$argument])) {
            return $this->variables[$argument];
        }
        return $this->evaluateMathExpression($argument);
    }

    private function evaluateSum(string $argument): float
    {
        if (isset($this->variables[$argument])) {
            return $this->variables[$argument];
        }
        return $this->evaluateMathExpression($argument);
    }

    private function evaluateCount(string $argument): float
    {
        if (isset($this->variables[$argument])) {
            return $this->variables[$argument];
        }
        return $this->evaluateMathExpression($argument);
    }

    private function evaluateMin(string $argument): float
    {
        if (isset($this->variables[$argument])) {
            return $this->variables[$argument];
        }
        return $this->evaluateMathExpression($argument);
    }

    private function evaluateMax(string $argument): float
    {
        if (isset($this->variables[$argument])) {
            return $this->variables[$argument];
        }
        return $this->evaluateMathExpression($argument);
    }
}
