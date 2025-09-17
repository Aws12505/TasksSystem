import { create } from 'zustand'
import { taskService } from '../../../services/taskService'
import { taskAssignmentService } from '../../../services/taskAssignmentService'
import { userService } from '../../../services/userService'
import { toast } from 'sonner'
import type { Task, CreateTaskRequest, UpdateTaskRequest, UpdateTaskStatusRequest, ComprehensiveCreateTaskRequest } from '../../../types/Task'
import type { TaskWithAssignments } from '../../../types/TaskAssignment'
import type { User } from '../../../types/User'

interface TasksState {
  // Section-based tasks
  tasksBySection: Record<number, Task[]>
  // Global tasks list for pages that need all tasks
  allTasks: Task[]
  currentTask: Task | null
  currentTaskWithAssignments: TaskWithAssignments | null
  availableUsers: User[]
  pagination: Record<number, {
    current_page: number
    total: number
    per_page: number
    last_page: number
  }>
  globalPagination: {
    current_page: number
    total: number
    per_page: number
    last_page: number
  } | null
  isLoading: boolean
  error: string | null

  // Actions
  fetchAllTasks: (page?: number) => Promise<void> // 🔑 NEW: Fetch all tasks globally
  fetchTasksBySection: (sectionId: number, page?: number) => Promise<void>
  fetchTask: (id: number) => Promise<void>
  fetchTaskWithAssignments: (id: number) => Promise<void>
  fetchAvailableUsers: () => Promise<void>
  createTask: (data: CreateTaskRequest) => Promise<Task | null>
  updateTask: (id: number, data: UpdateTaskRequest) => Promise<Task | null>
  updateTaskStatus: (id: number, data: UpdateTaskStatusRequest) => Promise<Task | null>
  deleteTask: (id: number) => Promise<boolean>
  assignUsersToTask: (taskId: number, assignments: { user_id: number; percentage: number }[]) => Promise<boolean>
  addUserToTask: (taskId: number, userId: number, percentage: number) => Promise<boolean>
  updateUserAssignment: (taskId: number, userId: number, percentage: number) => Promise<boolean>
  removeUserFromTask: (taskId: number, userId: number) => Promise<boolean>
  clearCurrentTask: () => void
  getTasksBySection: (sectionId: number) => Task[]
  createTaskComprehensive: (data: ComprehensiveCreateTaskRequest) => Promise<Task | null>
}

export const useTasksStore = create<TasksState>((set, get) => ({
  tasksBySection: {},
  allTasks: [], // 🔑 NEW: Global tasks array
  currentTask: null,
  currentTaskWithAssignments: null,
  availableUsers: [],
  pagination: {},
  globalPagination: null, // 🔑 NEW: Global pagination
  isLoading: false,
  error: null,

  // 🔑 NEW: Fetch all tasks globally
  fetchAllTasks: async (page = 1) => {
    set({ isLoading: true, error: null })
    try {
      const response = await taskService.getTasks(page) // Use the global getTasks method
      if (response.success && response.data) {
        set({
          allTasks: response.data,
          globalPagination: response.pagination || {
            current_page: 1,
            total: response.data.length,
            per_page: 15,
            last_page: 1
          },
          isLoading: false
        })
      } else {
        set({ error: response.message || 'Failed to fetch tasks', isLoading: false })
        toast.error(response.message || 'Failed to fetch tasks')
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to fetch tasks'
      set({ error: errorMessage, isLoading: false })
      toast.error(errorMessage)
    }
  },

  fetchTasksBySection: async (sectionId: number, page = 1) => {
    set({ isLoading: true, error: null })
    try {
      const response = await taskService.getTasksBySection(sectionId, page)
      if (response.success && response.data) {
        set(state => ({
          tasksBySection: {
            ...state.tasksBySection,
            [sectionId]: response.data
          },
          pagination: {
            ...state.pagination,
            [sectionId]: response.pagination || {
              current_page: 1,
              total: response.data.length,
              per_page: 15,
              last_page: 1
            }
          },
          isLoading: false
        }))
      } else {
        set({ error: response.message || 'Failed to fetch tasks', isLoading: false })
        toast.error(response.message || 'Failed to fetch tasks')
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to fetch tasks'
      set({ error: errorMessage, isLoading: false })
      toast.error(errorMessage)
    }
  },

  fetchTask: async (id: number) => {
    set({ isLoading: true, error: null })
    try {
      const response = await taskService.getTask(id)
      if (response.success && response.data) {
        set({ currentTask: response.data, isLoading: false })
      } else {
        set({ error: response.message || 'Failed to fetch task', isLoading: false })
        toast.error(response.message || 'Failed to fetch task')
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to fetch task'
      set({ error: errorMessage, isLoading: false })
      toast.error(errorMessage)
    }
  },

  fetchTaskWithAssignments: async (id: number) => {
    try {
      const response = await taskAssignmentService.getTaskWithAssignments(id)
      if (response.success && response.data) {
        set({ currentTaskWithAssignments: response.data })
      } else {
        toast.error(response.message || 'Failed to fetch task assignments')
      }
    } catch (error: any) {
      console.error('Failed to fetch task assignments:', error)
      toast.error(error.message || 'Failed to fetch task assignments')
    }
  },

  fetchAvailableUsers: async () => {
    try {
      const response = await userService.getUsers(1, 100)
      if (response.success && response.data) {
        set({ availableUsers: response.data })
      }
    } catch (error: any) {
      console.error('Failed to fetch users:', error)
    }
  },

  createTask: async (data: CreateTaskRequest) => {
    set({ isLoading: true, error: null })
    try {
      const response = await taskService.createTask(data)
      if (response.success && response.data) {
        const newTask = response.data
        const sectionId = newTask.section_id
        
        // Update both section-specific and global task lists
        set(state => ({
          tasksBySection: {
            ...state.tasksBySection,
            [sectionId]: state.tasksBySection[sectionId] 
              ? [newTask, ...state.tasksBySection[sectionId]]
              : [newTask]
          },
          allTasks: [newTask, ...state.allTasks], // 🔑 Also update global list
          isLoading: false
        }))
        
        toast.success('Task created successfully')
        return newTask
      } else {
        set({ error: response.message || 'Failed to create task', isLoading: false })
        toast.error(response.message || 'Failed to create task')
        return null
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to create task'
      set({ error: errorMessage, isLoading: false })
      toast.error(errorMessage)
      return null
    }
  },

  updateTask: async (id: number, data: UpdateTaskRequest) => {
    set({ isLoading: true, error: null })
    try {
      const response = await taskService.updateTask(id, data)
      if (response.success && response.data) {
        const updatedTask = response.data
        const sectionId = updatedTask.section_id
        
        // Update both section-specific and global task lists
        set(state => ({
          tasksBySection: {
            ...state.tasksBySection,
            [sectionId]: state.tasksBySection[sectionId]?.map(task =>
              task.id === id ? updatedTask : task
            ) || [updatedTask]
          },
          allTasks: state.allTasks.map(task => // 🔑 Also update global list
            task.id === id ? updatedTask : task
          ),
          currentTask: state.currentTask?.id === id ? updatedTask : state.currentTask,
          isLoading: false
        }))
        
        toast.success('Task updated successfully')
        return updatedTask
      } else {
        set({ error: response.message || 'Failed to update task', isLoading: false })
        toast.error(response.message || 'Failed to update task')
        return null
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to update task'
      set({ error: errorMessage, isLoading: false })
      toast.error(errorMessage)
      return null
    }
  },

  updateTaskStatus: async (id: number, data: UpdateTaskStatusRequest) => {
    try {
      const response = await taskService.updateTaskStatus(id, data)
      if (response.success && response.data) {
        const updatedTask = response.data
        const sectionId = updatedTask.section_id
        
        // Update both section-specific and global task lists
        set(state => ({
          tasksBySection: {
            ...state.tasksBySection,
            [sectionId]: state.tasksBySection[sectionId]?.map(task =>
              task.id === id ? updatedTask : task
            ) || [updatedTask]
          },
          allTasks: state.allTasks.map(task => // 🔑 Also update global list
            task.id === id ? updatedTask : task
          ),
          currentTask: state.currentTask?.id === id ? updatedTask : state.currentTask,
        }))
        
        toast.success('Task status updated')
        return updatedTask
      } else {
        toast.error(response.message || 'Failed to update task status')
        return null
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update task status')
      return null
    }
  },

  deleteTask: async (id: number) => {
    set({ isLoading: true, error: null })
    try {
      const response = await taskService.deleteTask(id)
      if (response.success) {
        // Remove from both section-specific and global task lists
        set(state => {
          const newTasksBySection = { ...state.tasksBySection }
          Object.keys(newTasksBySection).forEach(sectionId => {
            newTasksBySection[parseInt(sectionId)] = newTasksBySection[parseInt(sectionId)]?.filter(
              task => task.id !== id
            ) || []
          })
          
          return {
            tasksBySection: newTasksBySection,
            allTasks: state.allTasks.filter(task => task.id !== id), // 🔑 Also remove from global list
            currentTask: state.currentTask?.id === id ? null : state.currentTask,
            isLoading: false
          }
        })
        
        toast.success('Task deleted successfully')
        return true
      } else {
        set({ error: response.message || 'Failed to delete task', isLoading: false })
        toast.error(response.message || 'Failed to delete task')
        return false
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to delete task'
      set({ error: errorMessage, isLoading: false })
      toast.error(errorMessage)
      return false
    }
  },

  // ... rest of the assignment methods remain the same

  assignUsersToTask: async (taskId: number, assignments: { user_id: number; percentage: number }[]) => {
    try {
      const response = await taskAssignmentService.assignUsersToTask(taskId, { assignments })
      if (response.success) {
        toast.success('Users assigned to task successfully')
        get().fetchTaskWithAssignments(taskId)
        return true
      } else {
        toast.error(response.message || 'Failed to assign users to task')
        return false
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to assign users to task')
      return false
    }
  },

  addUserToTask: async (taskId: number, userId: number, percentage: number) => {
    try {
      const response = await taskAssignmentService.addUserToTask(taskId, { user_id: userId, percentage })
      if (response.success) {
        toast.success('User added to task successfully')
        get().fetchTaskWithAssignments(taskId)
        return true
      } else {
        toast.error(response.message || 'Failed to add user to task')
        return false
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to add user to task')
      return false
    }
  },

  updateUserAssignment: async (taskId: number, userId: number, percentage: number) => {
    try {
      const response = await taskAssignmentService.updateUserAssignment(taskId, userId, { percentage })
      if (response.success) {
        toast.success('User assignment updated')
        get().fetchTaskWithAssignments(taskId)
        return true
      } else {
        toast.error(response.message || 'Failed to update user assignment')
        return false
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update user assignment')
      return false
    }
  },

  createTaskComprehensive: async (data: ComprehensiveCreateTaskRequest) => {
  set({ isLoading: true, error: null });
  try {
    const response = await taskService.createTaskComprehensive(data);
    if (response.success && response.data) {
      const newTask = response.data;
      const sectionId = newTask.section_id;
      
      set(state => ({
        tasksBySection: {
          ...state.tasksBySection,
          [sectionId]: state.tasksBySection[sectionId] 
            ? [newTask, ...state.tasksBySection[sectionId]]
            : [newTask]
        },
        allTasks: [newTask, ...state.allTasks],
        isLoading: false
      }));
      
      toast.success('Task created successfully with subtasks and assignments');
      return newTask;
    } else {
      set({ error: response.message || 'Failed to create task', isLoading: false });
      toast.error(response.message || 'Failed to create task');
      return null;
    }
  } catch (error: any) {
    const errorMessage = error.message || 'Failed to create task';
    set({ error: errorMessage, isLoading: false });
    toast.error(errorMessage);
    return null;
  }
},

  removeUserFromTask: async (taskId: number, userId: number) => {
    try {
      const response = await taskAssignmentService.removeUserFromTask(taskId, userId)
      if (response.success) {
        toast.success('User removed from task')
        get().fetchTaskWithAssignments(taskId)
        return true
      } else {
        toast.error(response.message || 'Failed to remove user from task')
        return false
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to remove user from task')
      return false
    }
  },

  clearCurrentTask: () => set({ 
    currentTask: null, 
    currentTaskWithAssignments: null, 
    error: null 
  }),

  getTasksBySection: (sectionId: number) => {
    return get().tasksBySection[sectionId] || []
  }
}))
