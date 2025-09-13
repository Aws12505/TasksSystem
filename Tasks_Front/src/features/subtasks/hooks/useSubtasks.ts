import { useEffect } from 'react'
import { useSubtasksStore } from '../stores/subtasksStore'

export const useSubtasks = (taskId?: number) => {
  const {
    subtasks,
    pagination,
    isLoading,
    error,
    fetchSubtasksByTask,
    createSubtask,
    updateSubtask,
    updateTaskStatus,
    deleteSubtask,
    toggleSubtaskCompletion
  } = useSubtasksStore()

  useEffect(() => {
    if (taskId) {
      fetchSubtasksByTask(taskId)
    }
  }, [taskId, fetchSubtasksByTask])

  return {
    subtasks,
    pagination,
    isLoading,
    error,
    fetchSubtasks: (taskId: number) => fetchSubtasksByTask(taskId),
    createSubtask,
    updateSubtask,
    updateTaskStatus,
    deleteSubtask,
    toggleCompletion: toggleSubtaskCompletion
  }
}
