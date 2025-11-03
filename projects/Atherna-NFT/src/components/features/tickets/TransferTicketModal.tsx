import React, { useState } from 'react'
import { AlertCircle, Send, CheckCircle2 } from 'lucide-react'
import { Modal } from '../../ui/Modal'
import { Button } from '../../ui/Button'
import { Input } from '../../ui/Input'
import { Card, CardContent } from '../../ui/Card'
import { Badge } from '../../ui/Badge'
import { useWallet } from '@txnlab/use-wallet-react'
import { AlgorandClient } from '@algorandfoundation/algokit-utils'
import { NftTicketClient } from '../../../contracts/NftTicket'
import { getAlgodConfigFromViteEnvironment } from '../../../utils/network/getAlgoClientConfigs'
import { formatAlgo, formatAddress } from '../../../lib/utils'
import { toast } from 'sonner'
import type { Ticket } from '../../../types/ticket'

interface TransferTicketModalProps {
  isOpen: boolean
  onClose: () => void
  ticket: Ticket
  appId: number
  onSuccess?: () => void
}

export function TransferTicketModal({
  isOpen,
  onClose,
  ticket,
  appId,
  onSuccess,
}: TransferTicketModalProps) {
  const [recipientAddress, setRecipientAddress] = useState('')
  const [transferFee, setTransferFee] = useState('')
  const [confirmed, setConfirmed] = useState(false)
  const [loading, setLoading] = useState(false)
  const { activeAddress, transactionSigner } = useWallet()

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

  const handleTransfer = async () => {
    if (!recipientAddress || recipientAddress.length !== 58) {
      toast.error('Please enter a valid Algorand address (58 characters)')
      return
    }

    if (!confirmed) {
      toast.error('Please confirm the transfer')
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
      const feeAmount = transferFee ? Math.round(parseFloat(transferFee) * 1_000_000) : 0

      const response = await client.send.transferTicket({
        args: {
          newOwnerAddress: recipientAddress,
          isFrozen: ticket.isFrozen,
          transferFee: feeAmount,
        },
      })

      toast.success(`Ticket transferred successfully! Transaction: ${response.txIds?.[0]?.slice(0, 8)}...`)
      if (onSuccess) onSuccess()
      onClose()
    } catch (error: any) {
      console.error('Transfer error:', error)
      toast.error(error.message || 'Transfer failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Transfer Ticket"
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
                <span className="text-sm text-slate-400">Asset ID</span>
                <code className="text-xs text-slate-300">#{ticket.assetId}</code>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Current Owner</span>
                <code className="text-xs text-slate-300">{formatAddress(ticket.ownerAddress)}</code>
              </div>
              {ticket.isFrozen && (
                <Badge variant="warning" className="mt-2">
                  ⚠️ Ticket is frozen - transfer will fail
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recipient Address */}
        <div>
          <Input
            label="Recipient Address"
            placeholder="Enter Algorand address (58 characters)"
            value={recipientAddress}
            onChange={(e) => setRecipientAddress(e.target.value)}
            maxLength={58}
            disabled={loading}
            helperText="The address that will receive this ticket"
          />
        </div>

        {/* Transfer Fee */}
        <div>
          <Input
            label="Transfer Fee (Optional, in ALGO)"
            type="number"
            placeholder="0"
            value={transferFee}
            onChange={(e) => setTransferFee(e.target.value)}
            step="0.1"
            min="0"
            disabled={loading}
            helperText="Optional fee to send to the new owner. Leave 0 for no fee."
          />
          {transferFee && parseFloat(transferFee) > 0 && (
            <p className="mt-1 text-sm text-purple-400">
              Will send {formatAlgo(parseFloat(transferFee) * 1_000_000)} to recipient
            </p>
          )}
        </div>

        {/* Warning */}
        <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-400 mt-0.5" />
            <div className="flex-1 space-y-1 text-sm">
              <p className="font-semibold text-yellow-400">Important Notice</p>
              <ul className="list-disc list-inside space-y-1 text-yellow-300/80">
                <li>This transfer is permanent and cannot be undone</li>
                <li>You will no longer own this ticket after transfer</li>
                <li>Make sure the recipient address is correct</li>
                {ticket.isFrozen && (
                  <li className="font-semibold">
                    This ticket is frozen. Transfer will fail until freeze period ends.
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>

        {/* Confirmation Checkbox */}
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            id="confirm-transfer"
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
            disabled={loading}
            className="mt-1 h-4 w-4 rounded border-slate-600 bg-slate-700 text-purple-600 focus:ring-purple-500"
          />
          <label htmlFor="confirm-transfer" className="text-sm text-slate-300">
            I understand that this transfer is permanent and I have verified the recipient address
            is correct.
          </label>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            className="flex-1"
            onClick={handleTransfer}
            disabled={!recipientAddress || recipientAddress.length !== 58 || !confirmed || loading}
            loading={loading}
          >
            <Send className="mr-2 h-4 w-4" />
            Transfer Ticket
          </Button>
        </div>
      </div>
    </Modal>
  )
}

