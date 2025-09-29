// pages/TasksPage.tsx
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
import { useTasks } from '../hooks/useTasks'
import { useFiltersStore } from '../../../stores/filtersStore'
import { usePermissions } from '@/hooks/usePermissions'
import TasksList from '../components/TasksList'
import { Plus, Search, CheckSquare } from 'lucide-react'
import type { TaskStatus } from '../../../types/Task'
import { taskAssignmentService } from '../../../services/taskAssignmentService'
import type { TaskWithAssignments } from '../../../types/TaskAssignment'

type AssigneeLite = { id: number; name: string; percentage: number }
type AssigneesMap = Record<number, AssigneeLite[]>

const TasksPage: React.FC = () => {
  const { tasks, isLoading, deleteTask, updateTaskStatus, pagination, goToPage, nextPage, prevPage } = useTasks()
  const { searchQuery, statusFilter, setSearchQuery, setStatusFilter } = useFiltersStore()
  const { hasPermission } = usePermissions()

  const [assigneesMap, setAssigneesMap] = useState<AssigneesMap>({})

  const handleDelete = async (id: number) => {
    if (!hasPermission('delete tasks')) return
    if (window.confirm('Are you sure you want to delete this task?')) {
      await deleteTask(id)
    }
  }

  const handleStatusChange = async (id: number, status: string) => {
    if (!hasPermission('edit tasks')) return
    await updateTaskStatus(id, { status: status as TaskStatus })
  }

  // Filters - apply to current page tasks only
  const filteredTasks = useMemo(() => {
    const q = searchQuery.toLowerCase()
    return tasks.filter(task => {
      const matchesSearch =
        task.name.toLowerCase().includes(q) ||
        task.description?.toLowerCase().includes(q)

      const matchesStatus = statusFilter === 'all' || task.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [tasks, searchQuery, statusFilter])

  // Fetch assignees for the tasks currently in view
  useEffect(() => {
    const run = async () => {
      if (!filteredTasks.length) {
        setAssigneesMap({})
        return
      }

      // unique section ids
      const sectionIds = Array.from(new Set(filteredTasks.map(t => t.section_id)))

      const results = await Promise.allSettled(
        sectionIds.map(id => taskAssignmentService.getSectionTasksWithAssignments(id))
      )

      // build map
      const next: AssigneesMap = {}
      results.forEach(res => {
        if (res.status !== 'fulfilled') return
        const payload = res.value
        if (!payload?.success || !Array.isArray(payload.data)) return
        ;(payload.data as TaskWithAssignments[]).forEach(twa => {
          next[twa.id] = (twa.assigned_users || []).map(u => ({
            id: u.id,
            name: u.name ?? u.email ?? `User #${u.id}`,
            percentage: u.pivot?.percentage ?? 0,
          }))
        })
      })

      setAssigneesMap(next)
    }

    run()
  }, [filteredTasks])

  // Generate pagination items
  const generatePaginationItems = () => {
    if (!pagination) return []

    const items = []
    const { current_page, last_page } = pagination
    
    // Always show first page
    if (current_page > 3) {
      items.push(1)
      if (current_page > 4) {
        items.push('ellipsis-start')
      }
    }

    // Show pages around current page
    for (let i = Math.max(1, current_page - 2); i <= Math.min(last_page, current_page + 2); i++) {
      items.push(i)
    }

    // Always show last page
    if (current_page < last_page - 2) {
      if (current_page < last_page - 3) {
        items.push('ellipsis-end')
      }
      items.push(last_page)
    }

    return items
  }

  return (
    <div className="space-y-6">
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

      {/* Filters */}
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-background border-input text-foreground"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
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
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Tasks</CardTitle>
            <CheckSquare className="w-4 h-4 text-chart-1" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {pagination?.total || filteredTasks.length}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">In Progress</CardTitle>
            <CheckSquare className="w-4 h-4 text-chart-2" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {filteredTasks.filter(t => t.status === 'in_progress').length}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
            <CheckSquare className="w-4 h-4 text-chart-3" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {filteredTasks.filter(t => t.status === 'done').length}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">High Priority</CardTitle>
            <CheckSquare className="w-4 h-4 text-chart-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {filteredTasks.filter(t => t.priority === 'high' || t.priority === 'critical').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* List */}
      <TasksList
        tasks={filteredTasks}
        isLoading={isLoading}
        onDelete={handleDelete}
        onStatusChange={handleStatusChange}
        assigneesMap={assigneesMap}
      />

      {/* Pagination */}
      {pagination && pagination.last_page > 1 && (
        <Card className="bg-card border-border">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {pagination.from || 0} to {pagination.to || 0} of {pagination.total} results
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
  )
}

export default TasksPage
