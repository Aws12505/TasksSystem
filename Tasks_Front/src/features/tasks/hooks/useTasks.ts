import { useEffect, useMemo } from 'react'
import { useTasksStore } from '../stores/tasksStore'

export const useTasks = (sectionId?: number) => {
  const {
    tasksBySection,
    allTasks,
    pagination,
    globalPagination,
    isLoading,
    error,
    fetchAllTasks, // 🔑 NEW
    fetchTasksBySection,
    createTask,
    updateTask,
    updateTaskStatus,
    deleteTask,
    getTasksBySection
  } = useTasksStore()

  // 🔑 Select the appropriate tasks and pagination based on whether sectionId is provided
  const tasks = useMemo(() => {
    if (sectionId !== undefined) {
      return getTasksBySection(sectionId)
    }
    return allTasks // 🔑 Return global tasks when no sectionId
  }, [sectionId, tasksBySection, allTasks, getTasksBySection])

  const currentPagination = useMemo(() => {
    if (sectionId !== undefined) {
      return pagination[sectionId] || null
    }
    return globalPagination // 🔑 Return global pagination when no sectionId
  }, [sectionId, pagination, globalPagination])

  useEffect(() => {
    if (sectionId !== undefined) {
      // Fetch tasks for specific section
      if (!tasks.length) {
        fetchTasksBySection(sectionId)
      }
    } else {
      // 🔑 Fetch all tasks globally when no sectionId provided
      if (!allTasks.length) {
        fetchAllTasks()
      }
    }
  }, [sectionId, tasks.length, allTasks.length, fetchTasksBySection, fetchAllTasks])

  return {
    tasks,
    pagination: currentPagination,
    isLoading,
    error,
    fetchTasks: sectionId !== undefined ? fetchTasksBySection : fetchAllTasks, // 🔑 Dynamic fetch method
    createTask,
    updateTask,
    updateTaskStatus,
    deleteTask
  }
}
