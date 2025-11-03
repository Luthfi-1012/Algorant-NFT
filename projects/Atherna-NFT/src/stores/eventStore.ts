import { create } from 'zustand'
import type { EventFilters, EventSortOption } from '../types/event'
import { SORT_OPTIONS } from '../lib/constants'

interface EventStore {
  // Filters
  filters: EventFilters
  sortOption: EventSortOption['value']
  
  // Actions
  setSearch: (search: string) => void
  setCategory: (categories: string[]) => void
  setStatus: (statuses: string[]) => void
  setDateRange: (range: EventFilters['dateRange']) => void
  setCustomDates: (start?: string, end?: string) => void
  setPriceRange: (min?: number, max?: number) => void
  setSortOption: (sort: EventSortOption['value']) => void
  resetFilters: () => void
}

const defaultFilters: EventFilters = {}

export const useEventStore = create<EventStore>((set) => ({
  filters: defaultFilters,
  sortOption: 'newest',
  
  setSearch: (search) =>
    set((state) => ({
      filters: { ...state.filters, search: search || undefined },
    })),
    
  setCategory: (categories) =>
    set((state) => ({
      filters: { ...state.filters, category: categories.length > 0 ? categories : undefined },
    })),
    
  setStatus: (statuses) =>
    set((state) => ({
      filters: { ...state.filters, status: statuses.length > 0 ? statuses : undefined },
    })),
    
  setDateRange: (range) =>
    set((state) => ({
      filters: { ...state.filters, dateRange: range },
    })),
    
  setCustomDates: (start, end) =>
    set((state) => ({
      filters: {
        ...state.filters,
        customDateStart: start,
        customDateEnd: end,
      },
    })),
    
  setPriceRange: (min, max) =>
    set((state) => ({
      filters: {
        ...state.filters,
        priceMin: min,
        priceMax: max,
      },
    })),
    
  setSortOption: (sort) => set({ sortOption: sort }),
  
  resetFilters: () =>
    set({
      filters: defaultFilters,
      sortOption: 'newest',
    }),
}))

