<?php

namespace App\Services;

use App\Models\TaskComment;
use App\Models\Task;
use Illuminate\Support\Facades\Auth;

class TaskCommentService
{
    /**
     * Create a comment
     */
    public function createComment(int $taskId, string $content): ?TaskComment
    {
        $task = Task::find($taskId);
        
        if (!$task) {
            return null;
        }

        $comment = TaskComment::create([
            'task_id' => $taskId,
            'user_id' => Auth::id(),
            'content' => $content,
        ]);

        return $comment->load('user');
    }

    /**
     * Update a comment
     */
    public function updateComment(int $commentId, string $content): ?TaskComment
    {
        $comment = TaskComment::find($commentId);
        
        if (!$comment) {
            return null;
        }

        $comment->update(['content' => $content]);
        
        return $comment->fresh('user');
    }

    /**
     * Delete a comment
     */
    public function deleteComment(int $commentId): bool
    {
        $comment = TaskComment::find($commentId);
        
        if (!$comment) {
            return false;
        }

        return $comment->delete();
    }

    /**
     * Check if user can modify comment (owner or has permission)
     */
    public function canModifyComment(int $commentId): bool
    {
        $comment = TaskComment::find($commentId);
        $user = Auth::user();
        
        if (!$comment || !$user) {
            return false;
        }

        // User owns the comment
        if ($comment->user_id === $user->id) {
            return true;
        }

        // User has the create tasks permission
        if ($user->hasPermissionTo('create tasks')) {
            return true;
        }

        return false;
    }
}
