import { useQuery } from '@tanstack/react-query'
import { useEventStore } from '../stores/eventStore'
import type { Event } from '../types/event'

/**
 * Mock data generator - Replace with actual API calls
 */
async function fetchEvents(filters: any, sort: string): Promise<Event[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))
  
  // Mock events data
  const mockEvents: Event[] = [
    {
      id: '1',
      eventName: 'Summer Music Festival 2024',
      description: 'The biggest music festival of the year featuring top artists',
      eventDateTimestamp: Math.floor(Date.now() / 1000) + 86400 * 30,
      price: 50_000_000, // 50 ALGO
      releaseDays: 7,
      royalty: 500,
      category: 'music',
      venue: 'Central Park',
      location: 'New York, NY',
      totalTickets: 1000,
      soldTickets: 630,
      status: 'active',
    },
    {
      id: '2',
      eventName: 'Tech Conference 2024',
      description: 'Annual technology conference with industry leaders',
      eventDateTimestamp: Math.floor(Date.now() / 1000) + 86400 * 45,
      price: 100_000_000, // 100 ALGO
      releaseDays: 14,
      royalty: 750,
      category: 'conference',
      venue: 'Convention Center',
      location: 'San Francisco, CA',
      totalTickets: 500,
      soldTickets: 350,
      status: 'upcoming',
    },
    {
      id: '3',
      eventName: 'Championship Game',
      description: 'Final championship game of the season',
      eventDateTimestamp: Math.floor(Date.now() / 1000) + 86400 * 15,
      price: 75_000_000, // 75 ALGO
      releaseDays: 7,
      royalty: 600,
      category: 'sports',
      venue: 'Stadium Arena',
      location: 'Los Angeles, CA',
      totalTickets: 5000,
      soldTickets: 4800,
      status: 'active',
    },
  ]
  
  // Apply filters
  let filtered = [...mockEvents]
  
  if (filters.search) {
    const searchLower = filters.search.toLowerCase()
    filtered = filtered.filter(
      (event) =>
        event.eventName.toLowerCase().includes(searchLower) ||
        event.venue?.toLowerCase().includes(searchLower) ||
        event.location?.toLowerCase().includes(searchLower)
    )
  }
  
  if (filters.category && filters.category.length > 0) {
    filtered = filtered.filter((event) => filters.category.includes(event.category || ''))
  }
  
  if (filters.status && filters.status.length > 0) {
    filtered = filtered.filter((event) => filters.status.includes(event.status))
  }
  
  if (filters.priceMin) {
    filtered = filtered.filter((event) => event.price >= filters.priceMin! * 1_000_000)
  }
  
  if (filters.priceMax) {
    filtered = filtered.filter((event) => event.price <= filters.priceMax! * 1_000_000)
  }
  
  // Apply sorting
  switch (sort) {
    case 'price-low':
      filtered.sort((a, b) => a.price - b.price)
      break
    case 'price-high':
      filtered.sort((a, b) => b.price - a.price)
      break
    case 'date-soon':
      filtered.sort((a, b) => a.eventDateTimestamp - b.eventDateTimestamp)
      break
    case 'popular':
      filtered.sort((a, b) => (b.soldTickets || 0) - (a.soldTickets || 0))
      break
    default: // newest
      filtered.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
  }
  
  return filtered
}

export function useEvents(page: number = 1, itemsPerPage: number = 12) {
  const filters = useEventStore((state) => state.filters)
  const sortOption = useEventStore((state) => state.sortOption)
  
  return useQuery({
    queryKey: ['events', filters, sortOption, page],
    queryFn: async () => {
      const allEvents = await fetchEvents(filters, sortOption)
      const start = (page - 1) * itemsPerPage
      const end = start + itemsPerPage
      const paginatedEvents = allEvents.slice(start, end)
      
      return {
        events: paginatedEvents,
        totalItems: allEvents.length,
        totalPages: Math.ceil(allEvents.length / itemsPerPage),
        currentPage: page,
      }
    },
    staleTime: 30 * 1000,
  })
}

export function useEvent(id: string) {
  return useQuery({
    queryKey: ['event', id],
    queryFn: async () => {
      const events = await fetchEvents({}, 'newest')
      return events.find((e) => e.id === id) || null
    },
    enabled: !!id,
  })
}

