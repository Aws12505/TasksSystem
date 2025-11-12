import { create } from 'zustand';
import { taskCommentService } from '../../../services/taskCommentService';
import { toast } from 'sonner';
import type { TaskComment, CreateTaskCommentRequest, UpdateTaskCommentRequest } from '../../../types/TaskComment';

interface TaskCommentsState {
  isLoading: boolean;
  error: string | null;

  createComment: (taskId: number, data: CreateTaskCommentRequest) => Promise<TaskComment | null>;
  updateComment: (commentId: number, data: UpdateTaskCommentRequest) => Promise<TaskComment | null>;
  deleteComment: (commentId: number) => Promise<boolean>;
}

export const useTaskCommentsStore = create<TaskCommentsState>((set) => ({
  isLoading: false,
  error: null,

  createComment: async (taskId: number, data: CreateTaskCommentRequest) => {
    set({ isLoading: true, error: null });
    try {
      const response = await taskCommentService.createComment(taskId, data);
      if (response.success && response.data) {
        set({ isLoading: false });
        toast.success('Comment added successfully');
        return response.data;
      } else {
        set({ error: response.message || 'Failed to create comment', isLoading: false });
        toast.error(response.message || 'Failed to create comment');
        return null;
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to create comment';
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
      return null;
    }
  },

  updateComment: async (commentId: number, data: UpdateTaskCommentRequest) => {
    set({ isLoading: true, error: null });
    try {
      const response = await taskCommentService.updateComment(commentId, data);
      if (response.success && response.data) {
        set({ isLoading: false });
        toast.success('Comment updated successfully');
        return response.data;
      } else {
        set({ error: response.message || 'Failed to update comment', isLoading: false });
        toast.error(response.message || 'Failed to update comment');
        return null;
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to update comment';
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
      return null;
    }
  },

  deleteComment: async (commentId: number) => {
    set({ isLoading: true, error: null });
    try {
      const response = await taskCommentService.deleteComment(commentId);
      if (response.success) {
        set({ isLoading: false });
        toast.success('Comment deleted successfully');
        return true;
      } else {
        set({ error: response.message || 'Failed to delete comment', isLoading: false });
        toast.error(response.message || 'Failed to delete comment');
        return false;
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to delete comment';
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
      return false;
    }
  },
}));
