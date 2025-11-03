import React, { useState } from 'react'
import { X } from 'lucide-react'
import { PurchaseFlowModal } from '../features/purchase/PurchaseFlowModal'

interface Event {
  id: number | string
  name: string
  date: string
  timestamp: number
  price: number
  sold: number
  total: number
}

interface PurchaseModalProps {
  event: Event
  onClose: () => void
  appId: number
}

export function PurchaseModal({ event, onClose, appId }: PurchaseModalProps) {
  const [showPurchaseFlow, setShowPurchaseFlow] = useState(false)
  const [quantity, setQuantity] = useState(1)

  const maxQuantity = Math.min(4, event.total - event.sold)

  const handlePurchase = () => {
    if (quantity < 1 || quantity > maxQuantity) {
      return
    }
    setShowPurchaseFlow(true)
  }

  if (showPurchaseFlow) {
    return (
      <PurchaseFlowModal
        isOpen={showPurchaseFlow}
        onClose={() => {
          setShowPurchaseFlow(false)
          onClose()
        }}
        eventId={event.id.toString()}
        eventName={event.name}
        eventDate={event.timestamp}
        ticketPrice={event.price}
        quantity={quantity}
        onSuccess={() => {
          onClose()
        }}
      />
    )
  }

  const totalPrice = event.price * quantity

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-slate-900 to-purple-900 border border-purple-500/30 rounded-2xl p-8 max-w-md w-full">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Purchase Ticket</h2>
          <button
            onClick={onClose}
            className="text-purple-300 hover:text-white transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="bg-white/5 border border-purple-500/20 rounded-xl p-4 mb-6">
          <h3 className="font-bold mb-2">{event.name}</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-purple-300">Date</span>
              <span>{event.date}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-purple-300">Price per ticket</span>
              <span className="font-semibold">Ⱥ {(event.price / 1_000_000).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-purple-300">Available</span>
              <span>{event.total - event.sold} tickets</span>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-semibold text-purple-300 mb-2">
            Quantity (Max: {maxQuantity})
          </label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => {
              const val = parseInt(e.target.value) || 1
              setQuantity(Math.max(1, Math.min(maxQuantity, val)))
            }}
            min="1"
            max={maxQuantity}
            className="w-full bg-white/5 border border-purple-500/30 rounded-lg px-4 py-2 focus:outline-none focus:border-purple-500"
          />
        </div>

        <div className="bg-purple-500/20 border border-purple-500/30 rounded-lg p-4 mb-6">
          <div className="flex justify-between font-bold">
            <span>Total</span>
            <span>Ⱥ {(totalPrice / 1_000_000).toFixed(2)}</span>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 bg-white/10 hover:bg-white/20 px-6 py-3 rounded-lg font-semibold transition"
          >
            Cancel
          </button>
          <button
            onClick={handlePurchase}
            disabled={quantity < 1 || quantity > maxQuantity || maxQuantity === 0}
            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed px-6 py-3 rounded-lg font-semibold transition"
          >
            Confirm Purchase
          </button>
        </div>
      </div>
    </div>
  )
}

