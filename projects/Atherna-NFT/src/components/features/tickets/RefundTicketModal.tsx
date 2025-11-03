import React, { useState } from 'react'
import { AlertCircle, RefreshCw, CheckCircle2 } from 'lucide-react'
import { Modal } from '../../ui/Modal'
import { Button } from '../../ui/Button'
import { Select } from '../../ui/Select'
import { Card, CardContent } from '../../ui/Card'
import { useWallet } from '@txnlab/use-wallet-react'
import { AlgorandClient } from '@algorandfoundation/algokit-utils'
import { NftTicketClient } from '../../../contracts/NftTicket'
import { getAlgodConfigFromViteEnvironment } from '../../../utils/network/getAlgoClientConfigs'
import { formatAlgo, formatDate } from '../../../lib/utils'
import { REFUND_REASONS } from '../../../lib/constants'
import { toast } from 'sonner'
import type { Ticket } from '../../../types/ticket'

interface RefundTicketModalProps {
  isOpen: boolean
  onClose: () => void
  ticket: Ticket
  appId: number
  onSuccess?: () => void
}

export function RefundTicketModal({
  isOpen,
  onClose,
  ticket,
  appId,
  onSuccess,
}: RefundTicketModalProps) {
  const [reason, setReason] = useState('')
  const [confirmed, setConfirmed] = useState(false)
  const [loading, setLoading] = useState(false)
  const { activeAddress, transactionSigner } = useWallet()

  const now = Math.floor(Date.now() / 1000)
  const isPastEvent = ticket.eventDate <= now
  const refundDeadlineDays = 7
  const refundDeadline = ticket.eventDate - refundDeadlineDays * 86400
  const canRefund = !isPastEvent && now < refundDeadline

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

  const handleRefund = async () => {
    if (!confirmed) {
      toast.error('Please confirm the refund')
      return
    }

    if (!activeAddress || !transactionSigner) {
      toast.error('Please connect wallet first')
      return
    }

    if (!appId || appId === 0) {
      toast.error('Smart contract App ID is not configured')
      return
    }

    const client = getClient()
    if (!client) {
      toast.error('Failed to initialize contract client')
      return
    }

    setLoading(true)
    try {
      const now = Math.floor(Date.now() / 1000)
      const refundDeadlineDays = 7

      const response = await client.send.refundTicket({
        args: {
          buyerAddress: activeAddress,
          refundAmount: ticket.price,
          eventDate: ticket.eventDate,
          currentTime: now,
          refundDeadlineDays,
        },
      })

      toast.success(`Refund processed successfully! Transaction: ${response.txIds?.[0]?.slice(0, 8)}...`)
      if (onSuccess) onSuccess()
      onClose()
    } catch (error: any) {
      console.error('Refund error:', error)
      toast.error(error.message || 'Refund failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Request Refund"
      size="lg"
      showCloseButton={!loading}
    >
      <div className="space-y-6">
        {/* Ticket Info */}
        <Card>
          <CardContent className="py-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Event</span>
                <span className="font-semibold text-white">{ticket.eventName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Event Date</span>
                <span className="text-white">{formatDate(ticket.eventDate, 'long')}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Refund Amount</span>
                <span className="font-semibold text-purple-400">
                  {formatAlgo(ticket.price)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Asset ID</span>
                <code className="text-xs text-slate-300">#{ticket.assetId}</code>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Refund Status */}
        {isPastEvent ? (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-400 mt-0.5" />
              <div>
                <p className="font-semibold text-red-400">Cannot Refund</p>
                <p className="text-sm text-red-300/80">
                  This event has already occurred. Refunds are only available before the event date.
                </p>
              </div>
            </div>
          </div>
        ) : !canRefund ? (
          <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-400 mt-0.5" />
              <div>
                <p className="font-semibold text-yellow-400">Refund Deadline Passed</p>
                <p className="text-sm text-yellow-300/80">
                  Refunds must be requested at least {refundDeadlineDays} days before the event.
                  The deadline was {formatDate(refundDeadline, 'long')}.
                </p>
                <p className="mt-2 text-sm text-yellow-300/80">
                  You can still request an emergency refund if the event is cancelled.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-400 mt-0.5" />
              <div>
                <p className="font-semibold text-green-400">Eligible for Refund</p>
                <p className="text-sm text-green-300/80">
                  Refund deadline: {formatDate(refundDeadline, 'long')}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Refund Reason */}
        {canRefund && (
          <div>
            <Select
              label="Refund Reason (Optional)"
              placeholder="Select a reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              options={REFUND_REASONS as any}
              helperText="Selecting a reason helps us improve our service"
            />
          </div>
        )}

        {/* Policy Notice */}
        <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-4">
          <p className="mb-2 text-sm font-semibold text-white">Refund Policy</p>
          <ul className="space-y-1 text-xs text-slate-400">
            <li>• Refunds are processed within 24-48 hours</li>
            <li>• Refund amount will be sent back to your wallet</li>
            <li>• Ticket NFT will be burned/removed from your wallet</li>
            <li>• Refunds must be requested {refundDeadlineDays} days before the event</li>
            <li>
              • For event cancellations, use emergency refund (no deadline restriction)
            </li>
          </ul>
        </div>

        {/* Confirmation */}
        {canRefund && (
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="confirm-refund"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              disabled={loading}
              className="mt-1 h-4 w-4 rounded border-slate-600 bg-slate-700 text-purple-600 focus:ring-purple-500"
            />
            <label htmlFor="confirm-refund" className="text-sm text-slate-300">
              I understand that this refund is permanent and the ticket will be removed from my
              wallet. I will receive {formatAlgo(ticket.price)} back to my wallet.
            </label>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          {canRefund ? (
            <Button
              variant="primary"
              className="flex-1"
              onClick={handleRefund}
              disabled={!confirmed || loading}
              loading={loading}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Request Refund
            </Button>
          ) : (
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                // Navigate to emergency refund or show info
                toast.info('Use emergency refund for cancelled events')
              }}
            >
              Emergency Refund
            </Button>
          )}
        </div>
      </div>
    </Modal>
  )
}

