import { useEffect } from 'react'
import { useTasksStore } from '../stores/tasksStore'

export const useTasks = (sectionId?: number) => {
  const {
    tasks,
    pagination,
    isLoading,
    error,
    fetchTasksBySection,
    createTask,
    updateTask,
    updateTaskStatus,
    deleteTask
  } = useTasksStore()

  useEffect(() => {
    if (sectionId) {
      fetchTasksBySection(sectionId)
    }
  }, [sectionId, fetchTasksBySection])

  return {
    tasks,
    pagination,
    isLoading,
    error,
    fetchTasks: (sectionId: number) => fetchTasksBySection(sectionId),
    createTask,
    updateTask,
    updateTaskStatus,
    deleteTask
  }
}
