<?php

namespace App\Http\Controllers;

use App\Services\TaskCommentService;
use App\Http\Requests\StoreTaskCommentRequest;
use App\Http\Requests\UpdateTaskCommentRequest;
use Illuminate\Http\JsonResponse;

class TaskCommentController extends Controller
{
    public function __construct(
        private TaskCommentService $taskCommentService
    ) {}

    /**
     * Store a new comment
     */
    public function store(StoreTaskCommentRequest $request, int $taskId): JsonResponse
    {
        $comment = $this->taskCommentService->createComment($taskId, $request->validated()['content']);

        if (!$comment) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Task not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $comment,
            'message' => 'Comment created successfully',
        ], 201);
    }

    /**
     * Update a comment
     */
    public function update(UpdateTaskCommentRequest $request, int $commentId): JsonResponse
    {
        if (!$this->taskCommentService->canModifyComment($commentId)) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Unauthorized to modify this comment',
            ], 403);
        }

        $comment = $this->taskCommentService->updateComment($commentId, $request->validated()['content']);

        if (!$comment) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Comment not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $comment,
            'message' => 'Comment updated successfully',
        ]);
    }

    /**
     * Delete a comment
     */
    public function destroy(int $commentId): JsonResponse
    {
        if (!$this->taskCommentService->canModifyComment($commentId)) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Unauthorized to delete this comment',
            ], 403);
        }

        $deleted = $this->taskCommentService->deleteComment($commentId);

        if (!$deleted) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Comment not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => null,
            'message' => 'Comment deleted successfully',
        ]);
    }
}
