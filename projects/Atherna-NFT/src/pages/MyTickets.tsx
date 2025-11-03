import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Ticket as TicketIcon,
  Calendar,
  MapPin,
  QrCode,
  Send,
  RefreshCw,
  ExternalLink,
  Copy,
  Shield,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'
import { useWallet } from '@txnlab/use-wallet-react'
import { Button } from '../components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Modal } from '../components/ui/Modal'
import { Skeleton } from '../components/ui/Skeleton'
import { TICKET_FILTERS } from '../lib/constants'
import { formatAlgo, formatDate, daysUntil, copyToClipboard } from '../lib/utils'
import { getAssetExplorerUrl, getExplorerUrl, NETWORK } from '../lib/constants'
import { toast } from 'sonner'
import { QRCodeSVG } from 'qrcode.react'
import { TransferTicketModal } from '../components/features/tickets/TransferTicketModal'
import { RefundTicketModal } from '../components/features/tickets/RefundTicketModal'
import type { Ticket, TicketFilter } from '../types/ticket'

// Mock data - replace with actual API call
const mockTickets: Ticket[] = [
  {
    assetId: 123456789,
    eventId: '1',
    eventName: 'Summer Music Festival 2024',
    eventDate: Math.floor(Date.now() / 1000) + 86400 * 30,
    price: 50_000_000,
    purchaseDate: Math.floor(Date.now() / 1000) - 86400 * 5,
    ownerAddress: '0x123...',
    isFrozen: true,
    freezeReleaseDate: Math.floor(Date.now() / 1000) + 86400 * 23,
    category: 'music',
    venue: 'Central Park',
    location: 'New York, NY',
  },
  {
    assetId: 987654321,
    eventId: '2',
    eventName: 'Tech Conference 2024',
    eventDate: Math.floor(Date.now() / 1000) + 86400 * 45,
    price: 100_000_000,
    purchaseDate: Math.floor(Date.now() / 1000) - 86400 * 10,
    ownerAddress: '0x123...',
    isFrozen: true,
    freezeReleaseDate: Math.floor(Date.now() / 1000) + 86400 * 31,
    category: 'conference',
    venue: 'Convention Center',
    location: 'San Francisco, CA',
  },
]

export function MyTickets() {
  const { activeAddress } = useWallet()
  const [selectedFilter, setSelectedFilter] = useState<TicketFilter>('all')
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [showQRModal, setShowQRModal] = useState(false)
  const [showTransferModal, setShowTransferModal] = useState(false)
  const [showRefundModal, setShowRefundModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Simulate loading tickets
  React.useEffect(() => {
    setLoading(true)
    const timer = setTimeout(() => {
      setLoading(false)
    }, 500)
    return () => clearTimeout(timer)
  }, [selectedFilter])

  // Filter tickets
  const filteredTickets = React.useMemo(() => {
    let filtered = [...mockTickets]

    if (selectedFilter === 'upcoming') {
      filtered = filtered.filter((t) => t.eventDate > Math.floor(Date.now() / 1000))
    } else if (selectedFilter === 'past') {
      filtered = filtered.filter((t) => t.eventDate <= Math.floor(Date.now() / 1000))
    } else if (selectedFilter === 'transferable') {
      filtered = filtered.filter(
        (t) => !t.isFrozen || (t.freezeReleaseDate && t.freezeReleaseDate <= Math.floor(Date.now() / 1000))
      )
    }

    return filtered
  }, [selectedFilter])

  const handleCopyAssetId = async (assetId: number) => {
    try {
      const success = await copyToClipboard(assetId.toString())
      if (success) {
        toast.success('Asset ID copied to clipboard')
      } else {
        toast.error('Failed to copy to clipboard')
      }
    } catch (error) {
      console.error('Copy error:', error)
      toast.error('Failed to copy to clipboard')
    }
  }

  const handleShowQR = (ticket: Ticket) => {
    setSelectedTicket(ticket)
    setShowQRModal(true)
  }

  const handleTransfer = (ticket: Ticket) => {
    setSelectedTicket(ticket)
    setShowTransferModal(true)
  }

  const handleRefund = (ticket: Ticket) => {
    setSelectedTicket(ticket)
    setShowRefundModal(true)
  }

  if (!activeAddress) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="mx-auto mb-4 h-12 w-12 text-yellow-400" />
            <h2 className="mb-2 text-2xl font-bold text-white">Connect Your Wallet</h2>
            <p className="mb-6 text-slate-400">
              Please connect your wallet to view your tickets
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-2 text-4xl font-bold text-white">My Tickets</h1>
        <p className="text-lg text-slate-400">Manage your NFT ticket collection</p>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6 flex gap-2 border-b border-slate-700">
        {TICKET_FILTERS.map((filter) => (
          <button
            key={filter.value}
            onClick={() => setSelectedFilter(filter.value as TicketFilter)}
            className={`border-b-2 px-4 py-2 font-semibold transition-colors ${
              selectedFilter === filter.value
                ? 'border-purple-500 text-white'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Tickets Grid */}
      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <Skeleton className="h-64 w-full" />
            </Card>
          ))}
        </div>
      ) : filteredTickets.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <TicketIcon className="mx-auto mb-4 h-16 w-16 text-slate-600" />
            <h3 className="mb-2 text-xl font-semibold text-white">No Tickets Found</h3>
            <p className="mb-6 text-slate-400">
              {selectedFilter === 'all'
                ? "You don't have any tickets yet. Browse events to purchase tickets!"
                : `No ${selectedFilter} tickets found.`}
            </p>
            <Button variant="primary" onClick={() => {/* Navigate to events */}}>
              Browse Events
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredTickets.map((ticket, index) => (
            <motion.div
              key={ticket.assetId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Card hover={true}>
                {/* Ticket Image */}
                <div className="relative h-48 w-full overflow-hidden rounded-t-xl bg-gradient-to-br from-purple-600 to-pink-600">
                  {ticket.imageUrl ? (
                    <img
                      src={ticket.imageUrl}
                      alt={ticket.eventName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <TicketIcon className="h-20 w-20 text-white/30" />
                    </div>
                  )}
                  <div className="absolute top-4 right-4 flex flex-col gap-2">
                    {ticket.isFrozen && (
                      <Badge variant="warning" className="flex items-center gap-1">
                        <Shield className="h-3 w-3" />
                        Frozen
                      </Badge>
                    )}
                    {ticket.category && (
                      <Badge variant="default">{ticket.category}</Badge>
                    )}
                  </div>
                </div>

                <CardHeader>
                  <CardTitle className="line-clamp-2">{ticket.eventName}</CardTitle>
                  <CardDescription>
                    {ticket.venue}, {ticket.location}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Ticket Info */}
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-slate-300">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(ticket.eventDate, 'long')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-300">
                      <MapPin className="h-4 w-4" />
                      <span>{ticket.venue}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Price Paid</span>
                      <span className="font-semibold text-white">{formatAlgo(ticket.price)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Asset ID</span>
                      <div className="flex items-center gap-2">
                        <code className="text-xs text-slate-300">#{ticket.assetId}</code>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => handleCopyAssetId(ticket.assetId)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {ticket.isFrozen && ticket.freezeReleaseDate && (
                    <div className="rounded-lg bg-yellow-500/10 border border-yellow-500/30 p-3">
                      <p className="text-xs text-yellow-400">
                        Transferable in {daysUntil(ticket.freezeReleaseDate)} days
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleShowQR(ticket)}
                      className="w-full"
                    >
                      <QrCode className="mr-2 h-4 w-4" />
                      QR Code
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        window.open(getAssetExplorerUrl(ticket.assetId, NETWORK), '_blank')
                      }
                      className="w-full"
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Explorer
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTransfer(ticket)}
                      disabled={ticket.isFrozen}
                      className="w-full"
                      title={ticket.isFrozen ? 'Ticket is frozen' : 'Transfer ticket'}
                    >
                      <Send className="mr-2 h-4 w-4" />
                      Transfer
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRefund(ticket)}
                      className="w-full"
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Refund
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* QR Code Modal */}
      {selectedTicket && (
        <Modal
          isOpen={showQRModal}
          onClose={() => setShowQRModal(false)}
          title="Ticket QR Code"
          size="md"
        >
          <div className="space-y-4">
            <div className="flex justify-center rounded-lg bg-white p-6">
              <QRCodeSVG
                value={JSON.stringify({
                  assetId: selectedTicket.assetId,
                  ownerAddress: selectedTicket.ownerAddress,
                  eventId: selectedTicket.eventId,
                })}
                size={300}
                level="H"
              />
            </div>
            <Card>
              <CardContent className="py-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Event</span>
                  <span className="font-semibold text-white">{selectedTicket.eventName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Date</span>
                  <span className="text-white">{formatDate(selectedTicket.eventDate, 'long')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Asset ID</span>
                  <code className="text-xs text-slate-300">#{selectedTicket.assetId}</code>
                </div>
              </CardContent>
            </Card>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                // Download QR as SVG
                try {
                  const svg = document.querySelector('svg')
                  if (svg) {
                    const svgData = new XMLSerializer().serializeToString(svg)
                    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
                    const svgUrl = URL.createObjectURL(svgBlob)
                    const link = document.createElement('a')
                    link.download = `ticket-${selectedTicket.assetId}.svg`
                    link.href = svgUrl
                    link.click()
                    URL.revokeObjectURL(svgUrl)
                    toast.success('QR Code downloaded')
                  } else {
                    toast.error('QR Code not found')
                  }
                } catch (error) {
                  console.error('Download error:', error)
                  toast.error('Failed to download QR Code')
                }
              }}
            >
              Download QR Code
            </Button>
          </div>
        </Modal>
      )}

      {/* Transfer Modal */}
      {selectedTicket && (
        <TransferTicketModal
          isOpen={showTransferModal}
          onClose={() => setShowTransferModal(false)}
          ticket={selectedTicket}
          appId={parseInt(import.meta.env.VITE_APP_ID || '0')}
          onSuccess={() => {
            toast.success('Ticket transferred successfully!')
            setShowTransferModal(false)
            // Refresh tickets list
          }}
        />
      )}

      {/* Refund Modal */}
      {selectedTicket && (
        <RefundTicketModal
          isOpen={showRefundModal}
          onClose={() => setShowRefundModal(false)}
          ticket={selectedTicket}
          appId={parseInt(import.meta.env.VITE_APP_ID || '0')}
          onSuccess={() => {
            toast.success('Refund request processed!')
            setShowRefundModal(false)
            // Refresh tickets list
          }}
        />
      )}
    </div>
  )
}

