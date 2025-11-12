import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useTasks } from '../hooks/useTasks'
import { useFiltersStore } from '../../../stores/filtersStore'
import { usePermissions } from '@/hooks/usePermissions'
import TasksList from '../components/TasksList'
import { Plus, Search, CheckSquare, Users, Calendar } from 'lucide-react'
import type { TaskStatus } from '../../../types/Task'
import { userService } from '../../../services/userService'
import { useProjectsStore } from '../../projects/stores/projectsStore'
import type { User } from '../../../types/User'
import type { TaskFilters } from '../../../services/taskService'
import { CalendarWithInput } from '@/components/ui/calendar-with-input'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'

const PER_PAGE = 15

const TasksPage: React.FC = () => {
  const {
    tasks,
    pagination,
    isLoading,
    deleteTask,
    updateTaskStatus,
    fetchTasks,       // stable (page, filters)
    goToPage,
    nextPage,
    prevPage,
  } = useTasks()

  const { searchQuery, statusFilter, setSearchQuery, setStatusFilter } = useFiltersStore()
  const { hasPermission } = usePermissions()

  const { projects, fetchProjects } = useProjectsStore()

  // Backend filters
  const [projectId, setProjectId] = useState<number | 'all'>('all')
  const [assigneesFilter, setAssigneesFilter] = useState<number[]>([])
  const [dueFrom, setDueFrom] = useState<string>('') // YYYY-MM-DD
  const [dueTo, setDueTo] = useState<string>('')     // YYYY-MM-DD

  // Assignee options (for dropdown)
  const [availableUsers, setAvailableUsers] = useState<User[]>([])
  const [assigneeDropdownOpen, setAssigneeDropdownOpen] = useState(false)

  // Delete confirmation dialog state
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null)

  useEffect(() => {
    fetchProjects()
    ;(async () => {
      try {
        const res = await userService.getUsers(1, 200)
        if (res.success && Array.isArray(res.data)) {
          setAvailableUsers(res.data)
        }
      } catch { /* ignore */ }
    })()
  }, [fetchProjects])

  // Build filters for backend
  const toBackendFilters = useMemo<TaskFilters>(() => ({
    status: statusFilter,
    project_id: projectId,
    assignees: assigneesFilter,
    due_from: dueFrom || undefined,
    due_to: dueTo || undefined,
    search: searchQuery || undefined,
    per_page: PER_PAGE,
  }), [statusFilter, projectId, assigneesFilter, dueFrom, dueTo, searchQuery])

  // Fetch when filters change (reset to page 1)
  useEffect(() => {
    fetchTasks(1, toBackendFilters)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toBackendFilters])

  // Assignee multi-select helpers
  const toggleAssignee = (id: number) =>
    setAssigneesFilter(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])

  const clearAssignees = () => setAssigneesFilter([])

  // Pagination items (server)
  const generatePaginationItems = () => {
    if (!pagination) return []
    const { current_page, last_page } = pagination
    const items: (number | 'ellipsis-start' | 'ellipsis-end')[] = []

    if (current_page > 3) {
      items.push(1)
      if (current_page > 4) items.push('ellipsis-start')
    }
    for (let i = Math.max(1, current_page - 2); i <= Math.min(last_page, current_page + 2); i++) {
      items.push(i)
    }
    if (current_page < last_page - 2) {
      if (current_page < last_page - 3) items.push('ellipsis-end')
      items.push(last_page)
    }
    return items
  }

  // Open confirm dialog instead of window.confirm
  const handleDelete = async (id: number) => {
    if (!hasPermission('delete tasks')) return
    setPendingDeleteId(id)
  }

  const confirmDelete = async () => {
    if (!hasPermission('delete tasks')) {
      setPendingDeleteId(null)
      return
    }
    if (pendingDeleteId != null) {
      await deleteTask(pendingDeleteId)
      setPendingDeleteId(null)
      if (pagination) fetchTasks(pagination.current_page, toBackendFilters)
    }
  }

  const handleStatusChange = async (id: number, status: string) => {
    if (!hasPermission('view tasks')) return
    await updateTaskStatus(id, { status: status as TaskStatus })
    if (pagination) fetchTasks(pagination.current_page, toBackendFilters)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 space-y-6 p-4 md:p-6 max-w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <CheckSquare className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground font-sans">Tasks</h1>
              <p className="text-muted-foreground">Manage your tasks and track progress</p>
            </div>
          </div>
          {hasPermission('create tasks') && (
            <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Link to="/tasks/create">
                <Plus className="mr-2 h-4 w-4" />
                New Task
              </Link>
            </Button>
          )}
        </div>

        {/* Filters (Server-side) */}
        <Card className="bg-card border-border">
          <CardContent className="p-4 space-y-3">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search tasks, projects, assignees, IDs…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-background border-input text-foreground"
                />
              </div>

              {/* Status */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                  <SelectItem value="rated">Rated</SelectItem>
                </SelectContent>
              </Select>

              {/* Project */}
              <Select
                value={projectId === 'all' ? 'all' : String(projectId)}
                onValueChange={(v) => setProjectId(v === 'all' ? 'all' : Number(v))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Projects</SelectItem>
                  {projects.map(p => (
                    <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Assignees */}
              <div className="relative">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => setAssigneeDropdownOpen(o => !o)}
                >
                  <Users className="w-4 h-4 mr-2" />
                  {assigneesFilter.length ? `${assigneesFilter.length} assignee(s)` : 'Filter assignees'}
                </Button>
                {assigneeDropdownOpen && (
  <div
    className="absolute z-20 mt-2 w-full rounded-md border bg-popover p-2 shadow"
    onMouseLeave={() => setAssigneeDropdownOpen(false)}
  >
    <div className="flex items-center justify-between px-2 py-1">
      <span className="text-sm font-medium">Assignees</span>
      <Button variant="ghost" size="sm" onClick={clearAssignees}>Clear</Button>
    </div>

    <ScrollArea className="max-h-64">
      <div className="space-y-1 pr-2">
        {availableUsers.map(u => {
          const checked = assigneesFilter.includes(u.id)
          return (
            <label
              key={u.id}
              className="flex items-center gap-2 px-2 py-1 rounded hover:bg-accent cursor-pointer"
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggleAssignee(u.id)}
              />
              <span className="text-sm">{u.name}</span>
            </label>
          )
        })}
      </div>
      <ScrollBar orientation="vertical" />
    </ScrollArea>
  </div>
)}

              </div>
            </div>

            {/* Date range */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-2 flex-wrap">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <CalendarWithInput
  id="due_from"
  name="due_from"
  value={dueFrom}
  onChange={setDueFrom}
  className="min-w-[140px]"
/>
<span className="text-muted-foreground text-sm">to</span>
<CalendarWithInput
  id="due_to"
  name="due_to"
  value={dueTo}
  onChange={setDueTo}
  className="min-w-[140px]"
/>
                {(dueFrom || dueTo) && (
                  <Button variant="ghost" size="sm" onClick={() => { setDueFrom(''); setDueTo('') }}>
                    Clear
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats (server-side total) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total (filtered)</CardTitle>
              <CheckSquare className="w-4 h-4 text-chart-1" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {pagination?.total ?? 0}
              </div>
            </CardContent>
          </Card>

          {/* Page-local quick counts */}
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">In Progress (page)</CardTitle>
              <CheckSquare className="w-4 h-4 text-chart-2" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {tasks.filter(t => t.status === 'in_progress').length}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Completed (page)</CardTitle>
              <CheckSquare className="w-4 h-4 text-chart-3" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {tasks.filter(t => t.status === 'done').length}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">High Priority (page)</CardTitle>
              <CheckSquare className="w-4 h-4 text-chart-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {tasks.filter(t => t.priority === 'high' || t.priority === 'critical').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* List Container with Fixed Height and Scroll */}
        <Card className="bg-card border-border flex-1 flex flex-col min-h-0">
          <CardContent className="p-0 flex-1 flex flex-col min-h-0">
            <div className="flex-1 overflow-hidden">
              <TasksList
                tasks={tasks}
                isLoading={isLoading}
                onDelete={async (id) => { await handleDelete(id) }} 
                onStatusChange={async (id, status) => { await handleStatusChange(id, status) }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Pagination */}
        {pagination && pagination.last_page > 1 && (
          <Card className="bg-card border-border">
            <CardContent className="p-3">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-muted-foreground text-center sm:text-left">
                  Showing {pagination.from || 0} to {pagination.to || 0} of {pagination.total || 0} results
                </div>
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={prevPage}
                        className={pagination.current_page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>

                    {generatePaginationItems().map((item, index) => (
                      <PaginationItem key={index}>
                        {item === 'ellipsis-start' || item === 'ellipsis-end' ? (
                          <PaginationEllipsis />
                        ) : (
                          <PaginationLink
                            onClick={() => goToPage(item as number)}
                            isActive={pagination.current_page === item}
                            className="cursor-pointer"
                          >
                            {item}
                          </PaginationLink>
                        )}
                      </PaginationItem>
                    ))}

                    <PaginationItem>
                      <PaginationNext
                        onClick={nextPage}
                        className={pagination.current_page === pagination.last_page ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Centered confirmation dialog (shadcn centers in viewport by default) */}
      <AlertDialog
        open={pendingDeleteId !== null}
        onOpenChange={(open) => !open && setPendingDeleteId(null)}
      >
        <AlertDialogContent className="sm:max-w-[480px]">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete task</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this task? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingDeleteId(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default TasksPage
