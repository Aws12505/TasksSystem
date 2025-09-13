import { create } from 'zustand'

interface SidebarState {
  isOpen: boolean
  isMobile: boolean
  activeSection: string
  toggleSidebar: () => void
  setActiveSection: (section: string) => void
  setMobile: (isMobile: boolean) => void
}

export const useSidebarStore = create<SidebarState>((set) => ({
  isOpen: true,
  isMobile: false,
  activeSection: 'dashboard',
  
  toggleSidebar: () => set((state) => ({ isOpen: !state.isOpen })),
  
  setActiveSection: (section: string) => set({ activeSection: section }),
  
  setMobile: (isMobile: boolean) => set({ isMobile })
}))
