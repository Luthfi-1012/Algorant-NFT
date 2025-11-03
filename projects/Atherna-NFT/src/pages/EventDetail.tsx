import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Calendar,
  MapPin,
  DollarSign,
  Users,
  Clock,
  Ticket,
  Shield,
  ArrowLeft,
  Copy,
  ExternalLink,
} from 'lucide-react'
import { useEvent } from '../hooks/useEvents'
import { Button } from '../components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Skeleton } from '../components/ui/Skeleton'
import { PurchaseFlowModal } from '../components/features/purchase/PurchaseFlowModal'
import { formatAlgo, formatDate, daysUntil, copyToClipboard } from '../lib/utils'
import { getAssetExplorerUrl, NETWORK } from '../lib/constants'
import { useWallet } from '@txnlab/use-wallet-react'
import { toast } from 'sonner'

interface EventDetailProps {
  eventId: string
  onBack: () => void
}

export function EventDetail({ eventId, onBack }: EventDetailProps) {
  const { data: event, isLoading, error } = useEvent(eventId)
  const [showPurchaseModal, setShowPurchaseModal] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const { activeAddress } = useWallet()
  const [activeTab, setActiveTab] = useState<'about' | 'location' | 'terms'>('about')

  const maxQuantity = 4
  const price = event ? event.price / 1_000_000 : 0
  const totalPrice = price * quantity
  const canPurchase = activeAddress && event && event.status === 'active'
  const isSoldOut = event && event.totalTickets && event.soldTickets
    ? event.soldTickets >= event.totalTickets
    : false

  const handlePurchase = () => {
    if (!activeAddress) {
      toast.error('Please connect your wallet first')
      return
    }
    setShowPurchaseModal(true)
  }

  const handleCopyAddress = async (address: string) => {
    const success = await copyToClipboard(address)
    if (success) {
      toast.success('Address copied to clipboard')
    } else {
      toast.error('Failed to copy address')
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <Button variant="ghost" onClick={onBack} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Events
        </Button>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Skeleton className="h-96 w-full mb-6" />
            <Skeleton className="h-32 w-full" />
          </div>
          <div>
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <Button variant="ghost" onClick={onBack} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Events
        </Button>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-red-400">Event not found</p>
            <Button variant="outline" onClick={onBack} className="mt-4">
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      {/* Back Button */}
      <Button variant="ghost" onClick={onBack} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Events
      </Button>

      {/* Event Hero */}
      <div className="mb-8">
        <div className="relative h-96 w-full overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600">
          {event.imageUrl ? (
            <img src={event.imageUrl} alt={event.eventName} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center">
              <Ticket className="h-32 w-32 text-white/30" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
            <div className="mb-4 flex items-center gap-4">
              <Badge
                variant={
                  event.status === 'active'
                    ? 'success'
                    : event.status === 'sold-out'
                    ? 'error'
                    : 'info'
                }
                className="text-base px-4 py-1"
              >
                {event.status === 'sold-out' ? 'Sold Out' : event.status}
              </Badge>
              {event.category && (
                <Badge variant="default" className="text-base px-4 py-1">
                  {event.category}
                </Badge>
              )}
            </div>
            <h1 className="mb-2 text-4xl font-bold">{event.eventName}</h1>
            <p className="text-xl text-white/90">{event.venue}, {event.location}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Event Info Cards */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-purple-400" />
                  <CardTitle className="text-lg">Date & Time</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-white">{formatDate(event.eventDateTimestamp, 'long')}</p>
                <p className="text-sm text-slate-400">
                  {daysUntil(event.eventDateTimestamp)} days from now
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-purple-400" />
                  <CardTitle className="text-lg">Price</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-white">{formatAlgo(event.price)}</p>
                <p className="text-sm text-slate-400">per ticket</p>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Card>
            <div className="border-b border-slate-700">
              <div className="flex gap-4 px-6">
                <button
                  onClick={() => setActiveTab('about')}
                  className={`border-b-2 py-4 font-semibold transition-colors ${
                    activeTab === 'about'
                      ? 'border-purple-500 text-white'
                      : 'border-transparent text-slate-400 hover:text-white'
                  }`}
                >
                  About
                </button>
                <button
                  onClick={() => setActiveTab('location')}
                  className={`border-b-2 py-4 font-semibold transition-colors ${
                    activeTab === 'location'
                      ? 'border-purple-500 text-white'
                      : 'border-transparent text-slate-400 hover:text-white'
                  }`}
                >
                  Location
                </button>
                <button
                  onClick={() => setActiveTab('terms')}
                  className={`border-b-2 py-4 font-semibold transition-colors ${
                    activeTab === 'terms'
                      ? 'border-purple-500 text-white'
                      : 'border-transparent text-slate-400 hover:text-white'
                  }`}
                >
                  Terms
                </button>
              </div>
            </div>
            <CardContent className="pt-6">
              {activeTab === 'about' && (
                <div className="space-y-4">
                  <p className="text-slate-300">{event.description || 'No description available.'}</p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="flex items-center gap-3">
                      <Shield className="h-5 w-5 text-purple-400" />
                      <div>
                        <p className="font-semibold text-white">Anti-Scalping</p>
                        <p className="text-sm text-slate-400">
                          Frozen for {event.releaseDays} days before event
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <DollarSign className="h-5 w-5 text-purple-400" />
                      <div>
                        <p className="font-semibold text-white">Royalty</p>
                        <p className="text-sm text-slate-400">
                          {(event.royalty / 100).toFixed(1)}% on resale
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'location' && (
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-purple-400 mt-1" />
                    <div>
                      <p className="font-semibold text-white">{event.venue}</p>
                      <p className="text-slate-400">{event.location}</p>
                    </div>
                  </div>
                  {event.organizerAddress && (
                    <div className="mt-4 rounded-lg bg-slate-700/50 p-4">
                      <p className="mb-2 text-sm font-semibold text-slate-300">Organizer</p>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 text-sm text-slate-400">
                          {event.organizerAddress}
                        </code>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleCopyAddress(event.organizerAddress!)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => window.open(`https://testnet.explorer.algorand.org/address/${event.organizerAddress}`, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {activeTab === 'terms' && (
                <div className="space-y-4">
                  <div>
                    <h4 className="mb-2 font-semibold text-white">Refund Policy</h4>
                    <p className="text-sm text-slate-400">
                      Refunds are available until {event.releaseDays} days before the event date.
                      After that, tickets can only be refunded in case of event cancellation.
                    </p>
                  </div>
                  <div>
                    <h4 className="mb-2 font-semibold text-white">Transfer Policy</h4>
                    <p className="text-sm text-slate-400">
                      Tickets can be transferred {event.releaseDays} days before the event.
                      A transfer fee may apply.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Purchase Card */}
        <div>
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Purchase Tickets</CardTitle>
              <CardDescription>
                {event.totalTickets && (
                  <span>
                    {event.soldTickets || 0} / {event.totalTickets} sold
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {!activeAddress ? (
                <div className="space-y-4">
                  <p className="text-sm text-slate-400">
                    Connect your wallet to purchase tickets
                  </p>
                  <Button variant="primary" className="w-full" onClick={() => {/* Open wallet modal */}}>
                    Connect Wallet
                  </Button>
                </div>
              ) : isSoldOut ? (
                <div className="text-center">
                  <Badge variant="error" className="mb-4">Sold Out</Badge>
                  <p className="text-sm text-slate-400">
                    This event is sold out. Check back for resale tickets.
                  </p>
                </div>
              ) : (
                <>
                  {/* Quantity Selector */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-white">
                      Quantity (Max {maxQuantity})
                    </label>
                    <div className="flex items-center gap-4">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        disabled={quantity <= 1}
                      >
                        -
                      </Button>
                      <span className="flex-1 text-center text-2xl font-bold text-white">
                        {quantity}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setQuantity(Math.min(maxQuantity, quantity + 1))}
                        disabled={quantity >= maxQuantity}
                      >
                        +
                      </Button>
                    </div>
                  </div>

                  {/* Price Breakdown */}
                  <div className="rounded-lg bg-slate-700/50 p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Price per ticket</span>
                      <span className="text-white">{formatAlgo(event.price)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Quantity</span>
                      <span className="text-white">{quantity}</span>
                    </div>
                    <div className="border-t border-slate-600 pt-2 mt-2 flex justify-between font-semibold">
                      <span className="text-white">Total</span>
                      <span className="text-purple-400">{formatAlgo(totalPrice * 1_000_000)}</span>
                    </div>
                  </div>

                  {/* Purchase Button */}
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full"
                    onClick={handlePurchase}
                  >
                    <Ticket className="mr-2 h-5 w-5" />
                    Purchase {quantity} Ticket{quantity > 1 ? 's' : ''}
                  </Button>

                  <p className="text-xs text-center text-slate-400">
                    Your tickets will be NFT assets in your wallet
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Purchase Flow Modal */}
      <PurchaseFlowModal
        isOpen={showPurchaseModal}
        onClose={() => setShowPurchaseModal(false)}
        eventId={event.id}
        eventName={event.eventName}
        eventDate={event.eventDateTimestamp}
        ticketPrice={event.price}
        quantity={quantity}
        onSuccess={(assetIds) => {
          toast.success(`Successfully purchased ${quantity} ticket(s)!`)
          setShowPurchaseModal(false)
          // Could navigate to My Tickets page here
        }}
      />
    </div>
  )
}

