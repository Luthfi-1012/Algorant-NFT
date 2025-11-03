import React, { useState } from 'react'
import { Calendar, DollarSign, TrendingUp, Lock, AlertTriangle } from 'lucide-react'
import { useWallet } from '@txnlab/use-wallet-react'
import { AlgorandClient } from '@algorandfoundation/algokit-utils'
import { NftTicketClient } from '../../contracts/NftTicket'
import { getAlgodConfigFromViteEnvironment } from '../../utils/network/getAlgoClientConfigs'
import { StatCard } from './StatCard'
import { EventCard } from './EventCard'
import { toast } from 'sonner'

interface AdminPanelProps {
  appId: number
}

export function AdminPanel({ appId }: AdminPanelProps) {
  const { activeAddress, transactionSigner } = useWallet()
  const [loading, setLoading] = useState<string | null>(null)

  // Mock data - replace with real data
  const [events] = useState([
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
      frozen: false,
      releaseDate: "2025-11-17",
      royalty: 8
    },
    {
      id: 3,
      name: "Tech Conference 2025",
      date: "2026-01-10",
      timestamp: 1736467200,
      price: 2000000,
      sold: 250,
      total: 400,
      status: "active",
      frozen: true,
      releaseDate: "2026-01-05",
      royalty: 12
    }
  ])

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

  const handleEmergencyFreeze = async (event: any) => {
    if (!activeAddress || !transactionSigner) {
      toast.error('Please connect wallet first')
      return
    }

    const confirmed = window.confirm(
      `Are you sure you want to emergency freeze tickets for "${event.name}"?`
    )
    if (!confirmed) return

    const client = getClient()
    if (!client) return

    setLoading(`freeze-${event.id}`)
    try {
      const response = await client.send.emergencyFreeze()
      
      toast.success(`Emergency freeze activated! Transaction: ${response.txIds?.[0]?.slice(0, 8)}...`)
    } catch (error: any) {
      console.error('Emergency freeze error:', error)
      toast.error(error.message || 'Failed to emergency freeze')
    } finally {
      setLoading(null)
    }
  }

  const handleCancelEvent = async (event: any) => {
    if (!activeAddress || !transactionSigner) {
      toast.error('Please connect wallet first')
      return
    }

    const confirmed = window.confirm(
      `⚠️ WARNING: Cancel event "${event.name}"?\n\n` +
      `This will cancel the event and refund all buyers using cancel_event_refund method.\n\n` +
      `Are you sure you want to proceed?`
    )
    if (!confirmed) return

    const client = getClient()
    if (!client) {
      toast.error('Failed to initialize contract client')
      return
    }

    setLoading(`cancel-${event.id}`)
    try {
      // TODO: In production, get buyer addresses from:
      // 1. Contract local state (if stored)
      // 2. Indexer API queries for asset owners for this event
      // 3. Event logs from purchase transactions
      // 4. External database tracking purchases
      
      // For now, we'll show a prompt to manually input buyer addresses
      const buyerAddressesInput = window.prompt(
        `⚠️ CANCEL EVENT: "${event.name}"\n\n` +
        `Enter buyer addresses separated by commas to refund:\n\n` +
        `Example: ADDRESS1,ADDRESS2,ADDRESS3\n\n` +
        `Note: In production, these should be fetched automatically from contract state or indexer.`
      )

      if (!buyerAddressesInput || buyerAddressesInput.trim() === '') {
        toast.info('Event cancellation cancelled. No refunds processed.')
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
      const failedAddresses: string[] = []

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
          failedAddresses.push(buyerAddress)
        }
      }

      if (successCount > 0) {
        toast.success(
          `Event cancelled. Refunded ${successCount} buyer(s) successfully${failCount > 0 ? `. ${failCount} failed` : ''}`
        )
        
        if (failedAddresses.length > 0) {
          console.warn('Failed refund addresses:', failedAddresses)
          toast.warning(`${failCount} refund(s) failed. Check console for details.`)
        }
      } else {
        toast.error('Event cancellation failed. All refunds failed. Check console for details.')
      }
    } catch (error: any) {
      console.error('Cancel event error:', error)
      toast.error(error.message || 'Failed to cancel event')
    } finally {
      setLoading(null)
    }
  }

  if (!activeAddress) {
    return (
      <div className="bg-white/5 border border-purple-500/30 rounded-xl p-8 text-center">
        <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-yellow-400" />
        <p className="text-purple-300">Please connect your wallet to access Admin Panel</p>
      </div>
    )
  }

  // Calculate platform stats
  const platformStats = {
    totalEvents: events.length,
    totalRevenue: events.reduce((sum, e) => sum + ((e.sold || 0) * e.price), 0) / 1_000_000,
    platformFee: events.reduce((sum, e) => sum + ((e.sold || 0) * e.price * 0.01), 0) / 1_000_000, // 1% fee
  }

  if (appId === 0) {
    return (
      <div className="bg-white/5 border border-purple-500/30 rounded-xl p-8 text-center">
        <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-yellow-400" />
        <p className="text-purple-300 mb-4">App ID not configured. Please set VITE_APP_ID in your .env file</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Platform Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard 
          title="Total Events" 
          value={platformStats.totalEvents.toString()} 
          icon={Calendar} 
          color="purple" 
        />
        <StatCard 
          title="Total Revenue" 
          value={`Ⱥ ${platformStats.totalRevenue.toFixed(2)}`} 
          icon={DollarSign} 
          color="green" 
        />
        <StatCard 
          title="Platform Fee" 
          value={`Ⱥ ${platformStats.platformFee.toFixed(2)}`} 
          icon={TrendingUp} 
          color="blue" 
        />
      </div>

      {/* Events Management */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Events Management</h2>
          <span className="text-sm text-purple-300 bg-purple-500/20 px-3 py-1 rounded-full">
            {events.length} {events.length === 1 ? 'Event' : 'Events'}
          </span>
        </div>
        {events.length > 0 ? (
          events.map(event => (
            <div key={event.id} className="bg-white/5 border border-purple-500/30 rounded-xl overflow-hidden hover:bg-white/10 transition shadow-lg">
              <div className="p-6">
                <EventCard 
                  event={event}
                  isOrganizer={false}
                  loading={loading}
                />
              </div>
              <div className="px-6 pb-6 border-t border-purple-500/20 pt-4 bg-gradient-to-b from-transparent to-purple-500/5">
                <h3 className="text-xs font-semibold text-purple-300 mb-3 uppercase tracking-wider flex items-center gap-2">
                  <AlertTriangle className="w-3 h-3" />
                  Admin Actions
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <button 
                    onClick={() => handleEmergencyFreeze(event)}
                    disabled={loading === `freeze-${event.id}` || !!loading}
                    className="bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed px-4 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 text-white shadow-md hover:shadow-lg hover:shadow-yellow-600/30 transform hover:scale-105"
                  >
                    {loading === `freeze-${event.id}` ? (
                      <span className="animate-spin">⏳</span>
                    ) : (
                      <Lock className="w-4 h-4" />
                    )}
                    Emergency Freeze
                  </button>
                  <button 
                    onClick={() => handleCancelEvent(event)}
                    disabled={loading === `cancel-${event.id}` || !!loading}
                    className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed px-4 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 text-white shadow-md hover:shadow-lg hover:shadow-red-600/30 transform hover:scale-105"
                  >
                    {loading === `cancel-${event.id}` ? (
                      <span className="animate-spin">⏳</span>
                    ) : (
                      <AlertTriangle className="w-4 h-4" />
                    )}
                    Cancel Event
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white/5 border border-purple-500/30 rounded-xl p-8 text-center">
            <Calendar className="w-12 h-12 mx-auto mb-4 text-purple-400" />
            <p className="text-purple-300 mb-4">No events to manage</p>
          </div>
        )}
      </div>
    </div>
  )
}

