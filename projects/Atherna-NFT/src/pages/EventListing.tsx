import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Filter, Calendar, DollarSign, Tag, SlidersHorizontal, X } from 'lucide-react'
import { useEvents } from '../hooks/useEvents'
import { useEventStore } from '../stores/eventStore'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Select, type SelectOption } from '../components/ui/Select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Skeleton } from '../components/ui/Skeleton'
import { Pagination } from '../components/ui/Pagination'
import { Modal } from '../components/ui/Modal'
import { Slider } from '../components/ui/Slider'
import { EVENT_CATEGORIES, EVENT_STATUS, SORT_OPTIONS, DATE_RANGES } from '../lib/constants'
import { formatAlgo, formatDate, daysUntil } from '../lib/utils'
import { debounce } from '../lib/utils'

interface EventListingProps {
  onEventClick: (eventId: string) => void
}

export function EventListing({ onEventClick }: EventListingProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [showFilters, setShowFilters] = useState(false)
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  
  const filters = useEventStore((state) => state.filters)
  const sortOption = useEventStore((state) => state.sortOption)
  const setSearch = useEventStore((state) => state.setSearch)
  const setCategory = useEventStore((state) => state.setCategory)
  const setStatus = useEventStore((state) => state.setStatus)
  const setDateRange = useEventStore((state) => state.setDateRange)
  const setPriceRange = useEventStore((state) => state.setPriceRange)
  const setSortOption = useEventStore((state) => state.setSortOption)
  const resetFilters = useEventStore((state) => state.resetFilters)
  
  const { data, isLoading, error } = useEvents(currentPage, 12)
  
  // Debounced search
  const debouncedSearch = React.useMemo(
    () => debounce((value: string) => setSearch(value), 300),
    [setSearch]
  )
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSearch(e.target.value)
    setCurrentPage(1) // Reset to first page on search
  }
  
  const selectedCategories = filters.category || []
  const selectedStatuses = filters.status || []
  
  const handleCategoryToggle = (category: string) => {
    const newCategories = selectedCategories.includes(category)
      ? selectedCategories.filter((c) => c !== category)
      : [...selectedCategories, category]
    setCategory(newCategories)
    setCurrentPage(1)
  }
  
  const handleStatusToggle = (status: string) => {
    const newStatuses = selectedStatuses.includes(status)
      ? selectedStatuses.filter((s) => s !== status)
      : [...selectedStatuses, status]
    setStatus(newStatuses)
    setCurrentPage(1)
  }
  
  const handlePriceChange = (min: number, max: number) => {
    setPriceRange(min, max)
    setCurrentPage(1)
  }
  
  const activeFiltersCount =
    (selectedCategories.length > 0 ? 1 : 0) +
    (selectedStatuses.length > 0 ? 1 : 0) +
    (filters.priceMin || filters.priceMax ? 1 : 0) +
    (filters.dateRange ? 1 : 0)
  
  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-2 text-4xl font-bold text-white">Browse Events</h1>
        <p className="text-lg text-slate-400">Discover amazing NFT ticket events</p>
      </div>
      
      {/* Search & Sort Bar */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search events, venues, locations..."
              className="pl-10"
              defaultValue={filters.search}
              onChange={handleSearchChange}
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="md:hidden"
          >
            <Filter className="h-4 w-4" />
            {activeFiltersCount > 0 && (
              <Badge variant="info" className="ml-2">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </div>
        
        <div className="flex gap-2">
          <Select
            value={sortOption}
            onChange={(e) => {
              setSortOption(e.target.value as any)
              setCurrentPage(1)
            }}
            options={SORT_OPTIONS as SelectOption[]}
            className="w-48"
          />
        </div>
      </div>
      
      {/* Filters Sidebar (Desktop) */}
      {showFilters && (
        <div className="mb-6 hidden md:block">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <SlidersHorizontal className="h-5 w-5" />
                  Filters
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => resetFilters()}>
                  Reset
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Categories */}
              <div>
                <h3 className="mb-3 text-sm font-semibold text-white">Category</h3>
                <div className="flex flex-wrap gap-2">
                  {EVENT_CATEGORIES.map((cat) => (
                    <Badge
                      key={cat.value}
                      variant={selectedCategories.includes(cat.value) ? 'info' : 'default'}
                      className="cursor-pointer"
                      onClick={() => handleCategoryToggle(cat.value)}
                    >
                      {cat.label}
                    </Badge>
                  ))}
                </div>
              </div>
              
              {/* Status */}
              <div>
                <h3 className="mb-3 text-sm font-semibold text-white">Status</h3>
                <div className="flex flex-wrap gap-2">
                  {EVENT_STATUS.map((status) => (
                    <Badge
                      key={status.value}
                      variant={selectedStatuses.includes(status.value) ? 'success' : 'default'}
                      className="cursor-pointer"
                      onClick={() => handleStatusToggle(status.value)}
                    >
                      {status.label}
                    </Badge>
                  ))}
                </div>
              </div>
              
              {/* Price Range */}
              <div>
                <h3 className="mb-3 text-sm font-semibold text-white">Price Range</h3>
                <Slider
                  min={0}
                  max={50}
                  step={1}
                  value={filters.priceMax ? filters.priceMax : 50}
                  onChange={(e) => handlePriceChange(0, Number(e.target.value))}
                  valueLabel={`Up to ${filters.priceMax || 50} ALGO`}
                />
              </div>
              
              {/* Date Range */}
              <div>
                <h3 className="mb-3 text-sm font-semibold text-white">Date Range</h3>
                <Select
                  value={filters.dateRange || ''}
                  onChange={(e) => setDateRange(e.target.value as any)}
                  options={DATE_RANGES as SelectOption[]}
                  placeholder="Select date range"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Mobile Filters Modal */}
      <Modal
        isOpen={showMobileFilters}
        onClose={() => setShowMobileFilters(false)}
        title="Filters"
        size="lg"
      >
        <div className="space-y-6">
          {/* Same filter content as desktop */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-white">Category</h3>
            <div className="flex flex-wrap gap-2">
              {EVENT_CATEGORIES.map((cat) => (
                <Badge
                  key={cat.value}
                  variant={selectedCategories.includes(cat.value) ? 'info' : 'default'}
                  className="cursor-pointer"
                  onClick={() => handleCategoryToggle(cat.value)}
                >
                  {cat.label}
                </Badge>
              ))}
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => resetFilters()} className="flex-1">
              Reset
            </Button>
            <Button onClick={() => setShowMobileFilters(false)} className="flex-1">
              Apply Filters
            </Button>
          </div>
        </div>
      </Modal>
      
      {/* Events Grid */}
      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <Skeleton className="h-48 w-full" />
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-red-400">Error loading events. Please try again.</p>
          </CardContent>
        </Card>
      ) : !data || data.events.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-slate-400">No events found. Try adjusting your filters.</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                resetFilters()
                setCurrentPage(1)
              }}
            >
              Clear All Filters
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="mb-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {data.events.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card
                  hover
                  className="cursor-pointer"
                  onClick={() => onEventClick(event.id)}
                >
                  <div className="relative h-48 w-full overflow-hidden rounded-t-xl bg-gradient-to-br from-purple-600 to-pink-600">
                    {event.imageUrl ? (
                      <img src={event.imageUrl} alt={event.eventName} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Calendar className="h-16 w-16 text-white/30" />
                      </div>
                    )}
                    <div className="absolute top-4 right-4">
                      <Badge
                        variant={
                          event.status === 'active'
                            ? 'success'
                            : event.status === 'sold-out'
                            ? 'error'
                            : 'info'
                        }
                      >
                        {event.status === 'sold-out' ? 'Sold Out' : event.status}
                      </Badge>
                    </div>
                  </div>
                  
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="line-clamp-2 text-xl">{event.eventName}</CardTitle>
                      {event.category && (
                        <Badge variant="default" className="ml-2">
                          {EVENT_CATEGORIES.find((c) => c.value === event.category)?.label}
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="line-clamp-2">
                      {event.description || `${event.venue}, ${event.location}`}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-slate-300">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(event.eventDateTimestamp, 'long')}</span>
                        <span className="text-purple-400">
                          ({daysUntil(event.eventDateTimestamp)} days)
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-slate-300">
                        <DollarSign className="h-4 w-4" />
                        <span className="font-semibold text-white">{formatAlgo(event.price)}</span>
                      </div>
                      
                      {event.totalTickets && (
                        <div className="flex items-center gap-2 text-sm text-slate-400">
                          <Tag className="h-4 w-4" />
                          <span>
                            {event.soldTickets || 0} / {event.totalTickets} sold
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
          
          {/* Pagination */}
          {data.totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={data.totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </>
      )}
    </div>
  )
}

