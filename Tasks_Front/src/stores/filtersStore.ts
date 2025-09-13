import { create } from 'zustand'
import type { User } from '../types/User'
import type { Project } from '../types/Project'

interface FiltersState {
  dateRange: { start: Date | null; end: Date | null }
  selectedUser: User | null
  selectedProject: Project | null
  statusFilter: string
  searchQuery: string
  setDateRange: (range: { start: Date | null; end: Date | null }) => void
  setSelectedUser: (user: User | null) => void
  setSelectedProject: (project: Project | null) => void
  setStatusFilter: (status: string) => void
  setSearchQuery: (query: string) => void
  resetFilters: () => void
}

export const useFiltersStore = create<FiltersState>((set) => ({
  dateRange: { start: null, end: null },
  selectedUser: null,
  selectedProject: null,
  statusFilter: 'all',
  searchQuery: '',
  
  setDateRange: (range) => set({ dateRange: range }),
  
  setSelectedUser: (user) => set({ selectedUser: user }),
  
  setSelectedProject: (project) => set({ selectedProject: project }),
  
  setStatusFilter: (status) => set({ statusFilter: status }),
  
  setSearchQuery: (query) => set({ searchQuery: query }),
  
  resetFilters: () => set({
    dateRange: { start: null, end: null },
    selectedUser: null,
    selectedProject: null,
    statusFilter: 'all',
    searchQuery: ''
  })
}))
