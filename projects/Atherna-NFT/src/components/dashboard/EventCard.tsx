import React from 'react'
import { Calendar, Lock, Unlock, RefreshCw } from 'lucide-react'
import { formatDate } from '../../lib/utils'

interface Event {
  id: string | number
  name: string
  date: string
  timestamp: number
  price: number
  sold: number
  total: number
  status: string
  frozen: boolean
  releaseDate?: string
  royalty: number
}

interface EventCardProps {
  event: Event
  isOrganizer: boolean
  onPurchase?: () => void
  onReleaseFreeze?: () => void
  onRefundAll?: () => void
  loading?: string | null
}

export function EventCard({ 
  event, 
  isOrganizer, 
  onPurchase,
  onReleaseFreeze,
  onRefundAll,
  loading
}: EventCardProps) {
  const progress = event.total > 0 ? (event.sold / event.total) * 100 : 0
  const priceInAlgo = event.price / 1_000_000

  return (
    <div className="bg-white/5 border border-purple-500/30 rounded-xl p-6 hover:bg-white/10 transition">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold mb-1">{event.name}</h3>
          <div className="flex items-center gap-2 text-sm text-purple-300">
            <Calendar className="w-4 h-4" />
            {formatDate(event.timestamp, 'short') || event.date}
          </div>
        </div>
        {event.frozen && (
          <div className="bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
            <Lock className="w-3 h-3" />
            Frozen
          </div>
        )}
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-purple-300">Price</span>
          <span className="font-semibold">Ⱥ {priceInAlgo.toFixed(2)}</span>
        </div>
        {event.total > 0 && (
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-purple-300">Tickets Sold</span>
              <span className="font-semibold">{event.sold}/{event.total}</span>
            </div>
            <div className="bg-white/10 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
        {isOrganizer && (
          <div className="flex justify-between text-sm">
            <span className="text-purple-300">Royalty</span>
            <span className="font-semibold">{(event.royalty / 100).toFixed(1)}%</span>
          </div>
        )}
      </div>

      {isOrganizer ? (
        <div className="grid grid-cols-2 gap-2">
          <button 
            onClick={onReleaseFreeze}
            disabled={!event.frozen || loading === `release-${event.id}`}
            className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center justify-center gap-2"
          >
            {loading === `release-${event.id}` ? (
              <span className="animate-spin">⏳</span>
            ) : (
              <Unlock className="w-4 h-4" />
            )}
            Release Freeze
          </button>
          <button 
            onClick={onRefundAll}
            disabled={!!loading}
            className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refund All
          </button>
        </div>
      ) : (
        <button
          onClick={onPurchase}
          disabled={event.status === 'sold-out' || (event.total > 0 && event.sold >= event.total)}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed px-4 py-3 rounded-lg font-semibold transition"
        >
          {event.status === 'sold-out' || (event.total > 0 && event.sold >= event.total) 
            ? 'Sold Out' 
            : 'Purchase Ticket'}
        </button>
      )}
    </div>
  )
}

