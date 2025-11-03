import React, { useState } from 'react'
import { Ticket } from 'lucide-react'
import { useWallet } from '@txnlab/use-wallet-react'
import { TicketCard } from './TicketCard'
import { EventCard } from './EventCard'
import { PurchaseModal } from './PurchaseModal'

interface BuyerPortalProps {
  appId: number
}

export function BuyerPortal({ appId }: BuyerPortalProps) {
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null)
  const { activeAddress } = useWallet()

  // Mock data - replace with real data
  const events = [
    {
      id: 1,
      name: "Konser Coldplay Jakarta 2025",
      date: "2025-12-15",
      timestamp: 1734220800,
      price: 3000000,
      sold: 450,
      total: 500,
      status: "active",
      frozen: true,
      releaseDate: "2025-12-12",
      royalty: 10
    },
    {
      id: 2,
      name: "Festival Jazz Bali",
      date: "2025-11-20",
      timestamp: 1732060800,
      price: 1500000,
      sold: 180,
      total: 300,
      status: "active",
      frozen: true,
      releaseDate: "2025-11-17",
      royalty: 8
    }
  ]

  // Mock tickets
  const myTickets = [
    {
      id: 1,
      eventName: "Konser Coldplay Jakarta 2025",
      category: "VIP",
      seat: "A-25",
      price: 3000000,
      purchaseDate: Math.floor(Date.now() / 1000) - 86400 * 5,
      frozen: true,
      assetId: "745678901"
    }
  ]

  if (!activeAddress) {
    return (
      <div className="bg-white/5 border border-purple-500/30 rounded-xl p-8 text-center">
        <Ticket className="w-12 h-12 mx-auto mb-4 text-purple-400" />
        <p className="text-purple-300 mb-4">Please connect your wallet to view your tickets</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* My Tickets Section */}
      <div>
        <h2 className="text-2xl font-bold mb-4">My Tickets</h2>
        {myTickets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {myTickets.map(ticket => (
              <TicketCard key={ticket.id} ticket={ticket} />
            ))}
          </div>
        ) : (
          <div className="bg-white/5 border border-purple-500/30 rounded-xl p-8 text-center">
            <Ticket className="w-12 h-12 mx-auto mb-4 text-purple-400" />
            <p className="text-purple-300">You don't have any tickets yet</p>
          </div>
        )}
      </div>

      {/* Available Events */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Available Events</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {events.map(event => (
            <EventCard
              key={event.id}
              event={event}
              isOrganizer={false}
              onPurchase={() => setSelectedEventId(event.id)}
            />
          ))}
        </div>
      </div>

      {/* Purchase Modal */}
      {selectedEventId && (
        <PurchaseModal
          event={events.find(e => e.id === selectedEventId)!}
          onClose={() => setSelectedEventId(null)}
          appId={appId}
        />
      )}
    </div>
  )
}

