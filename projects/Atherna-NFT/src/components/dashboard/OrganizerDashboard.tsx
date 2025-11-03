import React, { useState } from 'react'
import { Calendar, Ticket, DollarSign, TrendingUp, Plus, Lock } from 'lucide-react'
import { useWallet } from '@txnlab/use-wallet-react'
import { AlgorandClient } from '@algorandfoundation/algokit-utils'
import { NftTicketClient } from '../../contracts/NftTicket'
import { getAlgodConfigFromViteEnvironment } from '../../utils/network/getAlgoClientConfigs'
import { StatCard } from './StatCard'
import { EventCard } from './EventCard'
import { CreateEventModal } from './CreateEventModal'
import { toast } from 'sonner'

interface OrganizerDashboardProps {
  appId: number
}

export function OrganizerDashboard({ appId }: OrganizerDashboardProps) {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [loading, setLoading] = useState<string | null>(null)
  const { activeAddress, transactionSigner } = useWallet()

  // Mock data - replace with real data from contract
  const [events, setEvents] = useState([
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
      royalty: 1000
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
      royalty: 800
    }
  ])

  // Calculate stats
  const stats = {
    totalEvents: events.length,
    totalSold: events.reduce((sum, e) => sum + e.sold, 0),
    revenue: events.reduce((sum, e) => sum + (e.sold * e.price), 0) / 1_000_000,
    royaltyEarned: events.reduce((sum, e) => sum + (e.sold * e.price * e.royalty / 10000), 0) / 1_000_000
  }

  const getClient = () => {
    if (!activeAddress || !transactionSigner) return null
    const algodConfig = getAlgodConfigFromViteEnvironment()
    const algorand = AlgorandClient.fromConfig({ algodConfig })
    
    return new NftTicketClient({
      id: appId,
      resolveBy: 'id',
      sender: activeAddress,
      signer: transactionSigner,
      algorand,
    })
  }

  const handleReleaseFreeze = async (event: any) => {
    if (!activeAddress || !transactionSigner) {
      toast.error('Please connect wallet first')
      return
    }

    const client = getClient()
    if (!client) return

    setLoading(`release-${event.id}`)
    try {
      const currentTime = Math.floor(Date.now() / 1000)
      const releaseDays = event.releaseDays || 7

      const response = await client.send.releaseFreeze({
        args: {
          eventDate: event.timestamp,
          currentTime,
          releaseDays,
        },
      })

      toast.success(`Freeze released! Transaction: ${response.txIds?.[0]?.slice(0, 8)}...`)
      
      // Update event status
      setEvents(events.map(e => 
        e.id === event.id ? { ...e, frozen: false } : e
      ))
    } catch (error: any) {
      console.error('Release freeze error:', error)
      toast.error(error.message || 'Failed to release freeze')
    } finally {
      setLoading(null)
    }
  }

  const handleRefundAll = async (event: any) => {
    if (!activeAddress || !transactionSigner) {
      toast.error('Please connect wallet first')
      return
    }

    const confirmed = window.confirm(
      `Are you sure you want to refund all tickets for "${event.name}"?\n\nThis will refund all buyers using cancel_event_refund method.`
    )
    if (!confirmed) return

    const client = getClient()
    if (!client) {
      toast.error('Failed to initialize contract client')
      return
    }

    setLoading(`refund-all-${event.id}`)
    try {
      // TODO: In production, get buyer addresses from:
      // 1. Contract local state (if stored)
      // 2. Indexer API queries for asset owners
      // 3. Event logs from purchase transactions
      // 4. External database tracking purchases
      
      // For now, we'll show a prompt to manually input buyer addresses
      // or use Refund Management section for individual refunds
      const buyerAddressesInput = window.prompt(
        `Enter buyer addresses separated by commas for "${event.name}"\n\n` +
        `Example: ADDRESS1,ADDRESS2,ADDRESS3\n\n` +
        `Note: In production, these should be fetched automatically from contract state or indexer.`
      )

      if (!buyerAddressesInput || buyerAddressesInput.trim() === '') {
        toast.info('Refund cancelled. Use Refund Management section for individual refunds.')
        return
      }

      const buyerAddresses = buyerAddressesInput
        .split(',')
        .map(addr => addr.trim())
        .filter(addr => addr.length === 58)

      if (buyerAddresses.length === 0) {
        toast.error('No valid Algorand addresses found')
        return
      }

      toast.info(`Processing refunds for ${buyerAddresses.length} buyers...`)

      const currentTime = Math.floor(Date.now() / 1000)
      const refundAmount = event.price

      // Process refunds sequentially
      let successCount = 0
      let failCount = 0

      for (const buyerAddress of buyerAddresses) {
        try {
          await client.send.cancelEventRefund({
            args: {
              buyerAddress,
              refundAmount,
              eventDate: event.timestamp,
              currentTime,
            },
          })
          successCount++
        } catch (error: any) {
          console.error(`Failed to refund ${buyerAddress}:`, error)
          failCount++
        }
      }

      if (successCount > 0) {
        toast.success(
          `Refunded ${successCount} buyer(s) successfully${failCount > 0 ? `, ${failCount} failed` : ''}`
        )
      } else {
        toast.error('All refunds failed. Check console for details.')
      }
    } catch (error: any) {
      console.error('Refund all error:', error)
      toast.error(error.message || 'Failed to process refunds')
    } finally {
      setLoading(null)
    }
  }

  if (!activeAddress) {
    return (
      <div className="bg-white/5 border border-purple-500/30 rounded-xl p-8 text-center">
        <Lock className="w-12 h-12 mx-auto mb-4 text-purple-400" />
        <p className="text-purple-300 mb-4">Please connect your wallet to access Organizer Dashboard</p>
      </div>
    )
  }

  if (appId === 0) {
    return (
      <div className="bg-white/5 border border-purple-500/30 rounded-xl p-8 text-center">
        <Lock className="w-12 h-12 mx-auto mb-4 text-yellow-400" />
        <p className="text-purple-300 mb-4">App ID not configured. Please set VITE_APP_ID in your .env file</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard 
          title="Total Events" 
          value={stats.totalEvents.toString()} 
          icon={Calendar} 
          color="purple" 
        />
        <StatCard 
          title="Total Sold" 
          value={stats.totalSold.toString()} 
          icon={Ticket} 
          color="pink" 
        />
        <StatCard 
          title="Revenue" 
          value={`Ⱥ ${stats.revenue.toFixed(2)}`} 
          icon={DollarSign} 
          color="green" 
        />
        <StatCard 
          title="Royalty Earned" 
          value={`Ⱥ ${stats.royaltyEarned.toFixed(2)}`} 
          icon={TrendingUp} 
          color="blue" 
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition"
        >
          <Plus className="w-5 h-5" />
          Create New Event
        </button>
      </div>

      {/* Events List */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Your Events</h2>
        {events.length > 0 ? (
          events.map(event => (
            <EventCard 
              key={event.id} 
              event={event} 
              isOrganizer={true}
              onReleaseFreeze={() => handleReleaseFreeze(event)}
              onRefundAll={() => handleRefundAll(event)}
              loading={loading}
            />
          ))
        ) : (
          <div className="bg-white/5 border border-purple-500/30 rounded-xl p-8 text-center">
            <Calendar className="w-12 h-12 mx-auto mb-4 text-purple-400" />
            <p className="text-purple-300 mb-4">No events created yet</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-purple-600 hover:bg-purple-700 px-6 py-2 rounded-lg font-semibold transition"
            >
              Create Your First Event
            </button>
          </div>
        )}
      </div>

      {/* Create Event Modal */}
      {showCreateModal && (
        <CreateEventModal 
          onClose={() => setShowCreateModal(false)} 
          appId={appId}
          onSuccess={() => {
            // Refetch events - temporary reload
            window.location.reload()
          }}
        />
      )}
    </div>
  )
}

