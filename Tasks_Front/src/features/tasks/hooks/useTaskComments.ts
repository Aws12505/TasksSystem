import { useTaskCommentsStore } from '../stores/taskCommentsStore';
import { useTasksStore } from '../stores/tasksStore';
import { useAuthStore } from '../../auth/stores/authStore';

export const useTaskComments = (taskId: number) => {
  const { isLoading, error, createComment, updateComment, deleteComment } = useTaskCommentsStore();
  const { currentTask, fetchTask } = useTasksStore();
  const { user } = useAuthStore();

  const comments = currentTask?.comments || [];

  const canModifyComment = (comment: any): boolean => {
    if (!user) return false;
    
    // User owns the comment
    if (comment.user_id === user.id) {
      return true;
    }
    
    // User has create tasks permission
    if (user.permissions?.some((p: any) => p.name === 'create tasks')) {
      return true;
    }
    
    return false;
  };

  const handleCreateComment = async (content: string) => {
    const comment = await createComment(taskId, { content });
    if (comment) {
      await fetchTask(taskId);
    }
    return comment;
  };

  const handleUpdateComment = async (commentId: number, content: string) => {
    const updated = await updateComment(commentId, { content });
    if (updated) {
      await fetchTask(taskId);
    }
    return updated;
  };

  const handleDeleteComment = async (commentId: number) => {
    const deleted = await deleteComment(commentId);
    if (deleted) {
      await fetchTask(taskId);
    }
    return deleted;
  };

  return {
    comments,
    isLoading,
    error,
    createComment: handleCreateComment,
    updateComment: handleUpdateComment,
    deleteComment: handleDeleteComment,
    canModifyComment,
  };
};
