import { useEffect } from 'react'
import { useTasksStore } from '../stores/tasksStore'

export const useTask = (taskId: number | string) => {
  const {
    currentTask,
    currentTaskWithAssignments,
    availableUsers,
    isLoading,
    error,
    fetchTask,
    fetchTaskWithAssignments,
    fetchAvailableUsers,
    assignUsersToTask,
    addUserToTask,
    updateUserAssignment,
    removeUserFromTask,
    clearCurrentTask
  } = useTasksStore()

  const id = typeof taskId === 'string' ? parseInt(taskId) : taskId

  useEffect(() => {
    if (id) {
      fetchTask(id)
      fetchTaskWithAssignments(id)
      fetchAvailableUsers()
    }

    return () => {
      clearCurrentTask()
    }
  }, [id, fetchTask, fetchTaskWithAssignments, fetchAvailableUsers, clearCurrentTask])

  return {
    task: currentTask,
    taskWithAssignments: currentTaskWithAssignments,
    availableUsers,
    isLoading,
    error,
    assignUsers: (assignments: { user_id: number; percentage: number }[]) => 
      assignUsersToTask(id, assignments),
    addUser: (userId: number, percentage: number) => 
      addUserToTask(id, userId, percentage),
    updateAssignment: (userId: number, percentage: number) => 
      updateUserAssignment(id, userId, percentage),
    removeUser: (userId: number) => 
      removeUserFromTask(id, userId)
  }
}
