import { create } from 'zustand'

interface UIState {
  statusFilter: 'all' | 'open' | 'resolved'
  setStatusFilter: (filter: 'all' | 'open' | 'resolved') => void
}

export const useUIStore = create<UIState>((set) => ({
  statusFilter: 'all',
  setStatusFilter: (filter) => set({ statusFilter: filter }),
}))
