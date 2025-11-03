import React, { useState } from 'react'
import { X } from 'lucide-react'
import { useWallet } from '@txnlab/use-wallet-react'
import { AlgorandClient } from '@algorandfoundation/algokit-utils'
import { NftTicketClient } from '../../contracts/NftTicket'
import { getAlgodConfigFromViteEnvironment } from '../../utils/network/getAlgoClientConfigs'
import { toast } from 'sonner'

interface CreateEventModalProps {
  onClose: () => void
  appId: number
  onSuccess?: () => void
}

export function CreateEventModal({ onClose, appId, onSuccess }: CreateEventModalProps) {
  const { transactionSigner, activeAddress } = useWallet()
  const [loading, setLoading] = useState(false)
  const [eventName, setEventName] = useState('')
  const [eventDate, setEventDate] = useState('')
  const [price, setPrice] = useState('')
  const [releaseDays, setReleaseDays] = useState('7')
  const [royalty, setRoyalty] = useState('500') // 5% in basis points

  const handleCreateEvent = async () => {
    if (!activeAddress || !transactionSigner) {
      toast.error('Please connect wallet first')
      return
    }

    if (!eventName || !eventDate || !price) {
      toast.error('Please fill all required fields')
      return
    }

    const priceNum = parseFloat(price)
    if (isNaN(priceNum) || priceNum <= 0) {
      toast.error('Please enter a valid price')
      return
    }

    setLoading(true)
    try {
      const algodConfig = getAlgodConfigFromViteEnvironment()
      const algorand = AlgorandClient.fromConfig({ algodConfig })
      
      const client = new NftTicketClient({
        id: appId,
        resolveBy: 'id',
        sender: activeAddress,
        signer: transactionSigner,
        algorand,
      })

      const eventDateTimestamp = Math.floor(new Date(eventDate).getTime() / 1000)
      const priceMicroAlgos = priceNum * 1_000_000
      const releaseDaysNum = parseInt(releaseDays) || 7
      const royaltyNum = parseInt(royalty) || 500

      if (royaltyNum > 10000) {
        toast.error('Royalty cannot exceed 100% (10000 basis points)')
        setLoading(false)
        return
      }

      const response = await client.send.createTicketEvent({
        args: {
          eventName,
          eventDateTimestamp,
          price: priceMicroAlgos,
          releaseDays: releaseDaysNum,
          royalty: royaltyNum,
        },
      })

      const txId = response.txIds?.[0] || 'Unknown'
      toast.success(`Event created! Transaction: ${txId.slice(0, 8)}...`)
      
      // Reset form
      setEventName('')
      setEventDate('')
      setPrice('')
      setReleaseDays('7')
      setRoyalty('500')
      
      onSuccess?.()
      onClose()
    } catch (error: any) {
      console.error('Create event error:', error)
      toast.error(error.message || 'Failed to create event')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-slate-900 to-purple-900 border border-purple-500/30 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Create New Event</h2>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-purple-300 hover:text-white transition disabled:opacity-50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-semibold text-purple-300 mb-2">
              Event Name *
            </label>
            <input
              type="text"
              placeholder="Konser Coldplay Jakarta 2025"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              disabled={loading}
              className="w-full bg-white/5 border border-purple-500/30 rounded-lg px-4 py-2 focus:outline-none focus:border-purple-500 disabled:opacity-50"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-purple-300 mb-2">
                Event Date *
              </label>
              <input
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                disabled={loading}
                min={new Date().toISOString().split('T')[0]}
                className="w-full bg-white/5 border border-purple-500/30 rounded-lg px-4 py-2 focus:outline-none focus:border-purple-500 disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-purple-300 mb-2">
                Ticket Price (ALGO) *
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                placeholder="3.0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                disabled={loading}
                className="w-full bg-white/5 border border-purple-500/30 rounded-lg px-4 py-2 focus:outline-none focus:border-purple-500 disabled:opacity-50"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-purple-300 mb-2">
                Release Days Before Event
              </label>
              <input
                type="number"
                min="0"
                placeholder="7"
                value={releaseDays}
                onChange={(e) => setReleaseDays(e.target.value)}
                disabled={loading}
                className="w-full bg-white/5 border border-purple-500/30 rounded-lg px-4 py-2 focus:outline-none focus:border-purple-500 disabled:opacity-50"
              />
              <p className="text-xs text-purple-400 mt-1">Days before event when tickets become transferable</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-purple-300 mb-2">
                Royalty (Basis Points)
              </label>
              <input
                type="number"
                min="0"
                max="10000"
                placeholder="500"
                value={royalty}
                onChange={(e) => setRoyalty(e.target.value)}
                disabled={loading}
                className="w-full bg-white/5 border border-purple-500/30 rounded-lg px-4 py-2 focus:outline-none focus:border-purple-500 disabled:opacity-50"
              />
              <p className="text-xs text-purple-400 mt-1">
                {royalty ? `${(parseInt(royalty) / 100).toFixed(2)}%` : '5%'} (500 = 5%)
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 bg-white/10 hover:bg-white/20 px-6 py-3 rounded-lg font-semibold transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleCreateEvent}
            disabled={loading || !eventName || !eventDate || !price}
            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-6 py-3 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin">⏳</span>
                Creating...
              </span>
            ) : (
              'Create Event'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

