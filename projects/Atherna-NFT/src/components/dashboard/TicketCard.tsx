import React from 'react'
import { Lock } from 'lucide-react'
import { formatDate } from '../../lib/utils'

interface Ticket {
  id: number | string
  eventName: string
  category?: string
  seat?: string
  price: number
  purchaseDate: number | string
  frozen: boolean
  assetId: string | number
  eventDate?: number
}

interface TicketCardProps {
  ticket: Ticket
  onViewQR?: () => void
  onTransfer?: () => void
}

export function TicketCard({ ticket, onViewQR, onTransfer }: TicketCardProps) {
  const priceInAlgo = ticket.price / 1_000_000
  const purchaseDate = typeof ticket.purchaseDate === 'number' 
    ? formatDate(ticket.purchaseDate, 'short') 
    : ticket.purchaseDate

  return (
    <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 border border-purple-500/30 rounded-xl p-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full -mr-16 -mt-16" />
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="font-bold mb-1">{ticket.eventName}</h3>
            {ticket.category && (
              <p className="text-sm text-purple-300">{ticket.category}</p>
            )}
          </div>
          {ticket.frozen && (
            <div className="bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded text-xs font-semibold flex items-center gap-1">
              <Lock className="w-3 h-3" />
              Frozen
            </div>
          )}
        </div>

        <div className="space-y-2 mb-4 text-sm">
          {ticket.seat && (
            <div className="flex justify-between">
              <span className="text-purple-300">Seat</span>
              <span className="font-semibold">{ticket.seat}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-purple-300">Price</span>
            <span className="font-semibold">Ⱥ {priceInAlgo.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-purple-300">Purchase Date</span>
            <span className="text-purple-300">{purchaseDate}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-purple-300">Asset ID</span>
            <span className="font-mono text-xs">{ticket.assetId}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button 
            onClick={onViewQR}
            className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-sm font-semibold transition"
          >
            View QR
          </button>
          <button
            onClick={onTransfer}
            disabled={ticket.frozen}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
              ticket.frozen
                ? 'bg-gray-600 cursor-not-allowed'
                : 'bg-purple-600 hover:bg-purple-700'
            }`}
          >
            Transfer
          </button>
        </div>
      </div>
    </div>
  )
}

