// pages/ProjectsPage.tsx
import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useProjects } from '../hooks/useProjects'
import { useFiltersStore } from '../../../stores/filtersStore'
import { usePermissions } from '@/hooks/usePermissions'
import ProjectsList from '../components/ProjectsList'
import { Plus, Search, FolderOpen } from 'lucide-react'

const ProjectsPage: React.FC = () => {
  const { 
    projects, 
    pagination,
    isLoading, 
    deleteProject,
    goToPage,
    nextPage,
    prevPage
  } = useProjects()
  const { searchQuery, statusFilter, setSearchQuery, setStatusFilter } = useFiltersStore()
  const { hasPermission } = usePermissions()

  // Delete confirmation dialog state
  const [pendingDeleteId, setPendingDeleteId] = React.useState<number | null>(null)

  const handleDelete = async (id: number) => {
    if (!hasPermission('delete projects')) return
    setPendingDeleteId(id) // open dialog
  }

  const confirmDelete = async () => {
    if (!hasPermission('delete projects')) {
      setPendingDeleteId(null)
      return
    }
    if (pendingDeleteId != null) {
      await deleteProject(pendingDeleteId)
      setPendingDeleteId(null)
    }
  }

  // Generate pagination items
  const generatePaginationItems = () => {
    if (!pagination) return []
    const items: (number | 'ellipsis-start' | 'ellipsis-end')[] = []
    const { current_page, last_page } = pagination
    
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

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 space-y-6 p-4 md:p-6 max-w-full">
        {/* Header (parity with TasksPage) */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <FolderOpen className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground font-sans">Projects</h1>
              <p className="text-muted-foreground">Manage your projects and track progress</p>
            </div>
          </div>
          {hasPermission('create projects') && (
            <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Link to="/projects/create">
                <Plus className="mr-2 h-4 w-4" />
                New Project
              </Link>
            </Button>
          )}
        </div>

        {/* Filters (same grid/spacing rhythm as TasksPage) */}
        <Card className="bg-card border-border">
          <CardContent className="p-4 space-y-3">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative lg:col-span-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search projects…"
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

              {/* Reserved for future filter to keep grid parity */}
              <div className="hidden lg:block" />
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards (same breakpoints as TasksPage) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Projects
              </CardTitle>
              <FolderOpen className="w-4 h-4 text-chart-1" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {pagination?.total || projects.length || 0}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                In Progress (page)
              </CardTitle>
              <FolderOpen className="w-4 h-4 text-chart-2" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {projects.filter(p => p.status === 'in_progress').length}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Completed (page)
              </CardTitle>
              <FolderOpen className="w-4 h-4 text-chart-3" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {projects.filter(p => p.status === 'done').length}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Avg Progress (page)
              </CardTitle>
              <FolderOpen className="w-4 h-4 text-chart-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {projects.length > 0 
                  ? Math.round(projects.reduce((sum, p) => sum + p.progress_percentage, 0) / projects.length)
                  : 0}%
              </div>
            </CardContent>
          </Card>
        </div>

        {/* List Container with Fixed Height and Scroll (parity with TasksPage) */}
        <Card className="bg-card border-border flex-1 flex flex-col min-h-0">
          <CardContent className="p-0 flex-1 flex flex-col min-h-0">
            <div className="flex-1 overflow-hidden">
              <ProjectsList 
                projects={projects} 
                isLoading={isLoading} 
                onDelete={async (id) => { await handleDelete(id) }} // ensure Promise<void>
              />
            </div>
          </CardContent>
        </Card>

        {/* Pagination (responsive like TasksPage) */}
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

      {/* Centered delete confirmation dialog (shadcn centers in the viewport by default) */}
      <AlertDialog
        open={pendingDeleteId !== null}
        onOpenChange={(open) => !open && setPendingDeleteId(null)}
      >
        <AlertDialogContent className="sm:max-w-[480px]">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this project? This action cannot be undone.
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

export default ProjectsPage
