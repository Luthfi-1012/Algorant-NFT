/**
 * Event Types
 */

export interface Event {
  id: string
  eventName: string
  description?: string
  eventDateTimestamp: number
  price: number // in microAlgos
  releaseDays: number
  royalty: number // in basis points
  category?: 'music' | 'sports' | 'conference' | 'theater' | 'other'
  venue?: string
  location?: string
  imageUrl?: string
  totalTickets?: number
  soldTickets?: number
  status: 'active' | 'upcoming' | 'past' | 'sold-out'
  createdAt?: number
  organizerAddress?: string
}

export interface EventFilters {
  search?: string
  category?: string[]
  status?: string[]
  dateRange?: 'today' | 'week' | 'month' | 'custom'
  customDateStart?: string
  customDateEnd?: string
  priceMin?: number
  priceMax?: number
}

export interface EventSortOption {
  value: 'newest' | 'price-low' | 'price-high' | 'popular' | 'date-soon'
  label: string
}

export interface PaginationInfo {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
}

