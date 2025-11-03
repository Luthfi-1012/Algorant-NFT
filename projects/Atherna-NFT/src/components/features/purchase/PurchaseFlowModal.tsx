import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckCircle2,
  Wallet,
  CreditCard,
  Sparkles,
  AlertCircle,
  Loader2,
  ExternalLink,
} from 'lucide-react'
import { Modal } from '../../ui/Modal'
import { Button } from '../../ui/Button'
import { Card, CardContent } from '../../ui/Card'
import { Badge } from '../../ui/Badge'
import { useWallet } from '@txnlab/use-wallet-react'
import { AlgorandClient, algo, TransactionComposer, SendAtomicTransactionComposerResults } from '@algorandfoundation/algokit-utils'
import { NftTicketClient } from '../../../contracts/NftTicket'
import { getAlgodConfigFromViteEnvironment } from '../../../utils/network/getAlgoClientConfigs'
import { encodeAddress, makePaymentTxnWithSuggestedParamsFromObject, SuggestedParams } from 'algosdk'
import { formatAlgo, copyToClipboard } from '../../../lib/utils'
import { APP_ID, getExplorerUrl, NETWORK } from '../../../lib/constants'
import { toast } from 'sonner'
// @ts-ignore
import confetti from 'canvas-confetti'

interface PurchaseFlowModalProps {
  isOpen: boolean
  onClose: () => void
  eventId: string
  eventName: string
  eventDate: number
  ticketPrice: number // in microAlgos
  quantity: number
  onSuccess?: (assetIds: number[]) => void
}

type Step = 'quantity' | 'wallet' | 'transaction' | 'success'

export function PurchaseFlowModal({
  isOpen,
  onClose,
  eventId,
  eventName,
  eventDate,
  ticketPrice,
  quantity: initialQuantity,
  onSuccess,
}: PurchaseFlowModalProps) {
  const [step, setStep] = useState<Step>('quantity')
  const [quantity, setQuantity] = useState(initialQuantity)
  const [loading, setLoading] = useState(false)
  const [txIds, setTxIds] = useState<string[]>([])
  const [assetIds, setAssetIds] = useState<number[]>([])
  const [error, setError] = useState<string | null>(null)

  const { activeAddress, transactionSigner } = useWallet()

  const totalPrice = ticketPrice * quantity
  const maxQuantity = 4

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setStep('quantity')
      setQuantity(initialQuantity)
      setLoading(false)
      setTxIds([])
      setAssetIds([])
      setError(null)
    }
  }, [isOpen, initialQuantity])

  const handleQuantityNext = () => {
    if (quantity < 1 || quantity > maxQuantity) {
      toast.error(`Please select quantity between 1 and ${maxQuantity}`)
      return
    }
    if (!activeAddress) {
      toast.error('Please connect your wallet first')
      return
    }
    setStep('wallet')
  }

  const handleWalletNext = async () => {
    if (!activeAddress || !transactionSigner) {
      toast.error('Wallet not connected')
      return
    }

    setStep('transaction')
    setLoading(true)
    setError(null)

    try {
      // Check if APP_ID is configured
      if (!APP_ID || APP_ID === 0) {
        throw new Error('Smart contract App ID is not configured. Please set VITE_APP_ID in .env file')
      }

      const algodConfig = getAlgodConfigFromViteEnvironment()
      const algorand = AlgorandClient.fromConfig({ algodConfig })
      
      const client = new NftTicketClient({
        id: APP_ID,
        resolveBy: 'id',
        sender: activeAddress,
        signer: transactionSigner,
        algorand,
      })

      // Get app account address (contract address for receiving payments)
      const contractAddress = client.appAddress

      // Process purchases sequentially (one at a time)
      const purchasedAssetIds: number[] = []
      const purchasedTxIds: string[] = []

      for (let i = 0; i < quantity; i++) {
        try {
          // Create atomic group: [Payment Txn] + [App Call Txn]
          const composer = client.compose()
          
          // 1. Payment transaction - send ALGO to contract account
          const paymentParams = await algorand.algod.getTransactionParams().do()
          const paymentTxn = makePaymentTxnWithSuggestedParamsFromObject({
            from: activeAddress,
            to: contractAddress, // App account address
            amount: ticketPrice,
            suggestedParams: paymentParams,
          })

          composer.addTransaction({ transaction: paymentTxn, signer: transactionSigner })

          // 2. App call transaction - purchase_ticket method
          composer.purchaseTicket({
            buyerAddress: activeAddress,
            eventDate: eventDate,
            ticketPrice: ticketPrice,
          })

          // Send atomic group
          const result = await composer.send()
          
          if (result.txIds && result.txIds.length > 0) {
            purchasedTxIds.push(result.txIds[0])
            // Generate a mock asset ID for now - in production, this would come from NFT creation
            purchasedAssetIds.push(Date.now() + i)
            
            toast.success(`Ticket ${i + 1}/${quantity} purchased!`)
          }
        } catch (err: any) {
          console.error(`Error purchasing ticket ${i + 1}:`, err)
          throw new Error(`Failed to purchase ticket ${i + 1}: ${err.message}`)
        }
      }

      setTxIds(purchasedTxIds)
      setAssetIds(purchasedAssetIds)
      setStep('success')
      setLoading(false)

      // Trigger confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      })

      // Call success callback
      if (onSuccess) {
        onSuccess(purchasedAssetIds)
      }

      toast.success(`Successfully purchased ${quantity} ticket(s)!`)
    } catch (err: any) {
      console.error('Purchase error:', err)
      setError(err.message || 'Failed to purchase tickets')
      setLoading(false)
      toast.error(err.message || 'Purchase failed')
    }
  }

  const handleClose = () => {
    if (step === 'success') {
      onClose()
    } else if (loading) {
      // Don't allow closing during transaction
      return
    } else {
      onClose()
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Purchase Tickets"
      size="lg"
      showCloseButton={!loading && step !== 'transaction'}
    >
      <div className="space-y-6">
        {/* Progress Steps */}
        <div className="flex items-center justify-between">
          {[
            { key: 'quantity', label: 'Quantity' },
            { key: 'wallet', label: 'Wallet' },
            { key: 'transaction', label: 'Transaction' },
            { key: 'success', label: 'Success' },
          ].map((s, index, array) => {
            const stepIndex = ['quantity', 'wallet', 'transaction', 'success'].indexOf(step)
            const isActive = index === stepIndex
            const isCompleted = index < stepIndex

            return (
              <React.Fragment key={s.key}>
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors ${
                      isCompleted
                        ? 'border-green-500 bg-green-500'
                        : isActive
                        ? 'border-purple-500 bg-purple-500'
                        : 'border-slate-600 bg-slate-700'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="h-5 w-5 text-white" />
                    ) : (
                      <span className="text-sm font-semibold text-white">{index + 1}</span>
                    )}
                  </div>
                  <span
                    className={`mt-2 text-xs ${
                      isActive ? 'font-semibold text-white' : 'text-slate-400'
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
                {index < array.length - 1 && (
                  <div
                    className={`h-0.5 flex-1 transition-colors ${
                      isCompleted ? 'bg-green-500' : 'bg-slate-600'
                    }`}
                  />
                )}
              </React.Fragment>
            )
          })}
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          {step === 'quantity' && (
            <motion.div
              key="quantity"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div>
                <h3 className="mb-2 text-lg font-semibold text-white">Select Quantity</h3>
                <p className="text-sm text-slate-400">Maximum {maxQuantity} tickets per purchase</p>
              </div>

              <div className="flex items-center justify-center gap-4 py-6">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  -
                </Button>
                <div className="text-center">
                  <div className="text-5xl font-bold text-white">{quantity}</div>
                  <div className="text-sm text-slate-400">ticket{quantity > 1 ? 's' : ''}</div>
                </div>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setQuantity(Math.min(maxQuantity, quantity + 1))}
                  disabled={quantity >= maxQuantity}
                >
                  +
                </Button>
              </div>

              <Card>
                <CardContent className="py-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Price per ticket</span>
                      <span className="text-white">{formatAlgo(ticketPrice)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Quantity</span>
                      <span className="text-white">{quantity}</span>
                    </div>
                    <div className="border-t border-slate-600 pt-2 flex justify-between font-semibold">
                      <span className="text-white">Total</span>
                      <span className="text-purple-400">{formatAlgo(totalPrice)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Button variant="primary" className="w-full" onClick={handleQuantityNext}>
                Continue to Wallet Check
              </Button>
            </motion.div>
          )}

          {step === 'wallet' && (
            <motion.div
              key="wallet"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div>
                <h3 className="mb-2 text-lg font-semibold text-white">Wallet Verification</h3>
                <p className="text-sm text-slate-400">Verify your wallet balance and connection</p>
              </div>

              {activeAddress ? (
                <Card>
                  <CardContent className="py-4 space-y-4">
                    <div className="flex items-center gap-3">
                      <Wallet className="h-5 w-5 text-green-400" />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-white">Wallet Connected</p>
                        <p className="text-xs text-slate-400 font-mono">{activeAddress}</p>
                      </div>
                      <Badge variant="success">Connected</Badge>
                    </div>

                    <div className="rounded-lg bg-slate-700/50 p-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Required Amount</span>
                        <span className="font-semibold text-white">{formatAlgo(totalPrice)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Transaction Fee</span>
                        <span className="text-slate-300">~0.001 ALGO</span>
                      </div>
                      <div className="border-t border-slate-600 pt-2 flex justify-between font-semibold">
                        <span className="text-white">Total Required</span>
                        <span className="text-purple-400">
                          {formatAlgo(totalPrice + 1000)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="py-8 text-center">
                    <AlertCircle className="mx-auto mb-4 h-12 w-12 text-yellow-400" />
                    <p className="text-slate-400">Please connect your wallet first</p>
                  </CardContent>
                </Card>
              )}

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setStep('quantity')}>
                  Back
                </Button>
                <Button
                  variant="primary"
                  className="flex-1"
                  onClick={handleWalletNext}
                  disabled={!activeAddress}
                >
                  Proceed to Transaction
                </Button>
              </div>
            </motion.div>
          )}

          {step === 'transaction' && (
            <motion.div
              key="transaction"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div>
                <h3 className="mb-2 text-lg font-semibold text-white">Processing Transaction</h3>
                <p className="text-sm text-slate-400">Please confirm the transaction in your wallet</p>
              </div>

              {loading ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-purple-400" />
                    <p className="text-slate-300">Processing your purchase...</p>
                    <p className="mt-2 text-sm text-slate-400">
                      Please approve the transaction in your wallet
                    </p>
                  </CardContent>
                </Card>
              ) : error ? (
                <Card>
                  <CardContent className="py-8">
                    <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-400" />
                    <p className="mb-4 text-center text-red-400">{error}</p>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => setStep('wallet')}
                    >
                      Go Back
                    </Button>
                  </CardContent>
                </Card>
              ) : null}
            </motion.div>
          )}

          {step === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="space-y-4"
            >
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500">
                  <CheckCircle2 className="h-10 w-10 text-white" />
                </div>
                <h3 className="mb-2 text-2xl font-bold text-white">Purchase Successful!</h3>
                <p className="text-slate-400">
                  You've successfully purchased {quantity} ticket{quantity > 1 ? 's' : ''} for{' '}
                  {eventName}
                </p>
              </div>

              <Card>
                <CardContent className="py-4 space-y-3">
                  <div>
                    <p className="mb-2 text-sm font-semibold text-slate-300">Asset IDs:</p>
                    <div className="space-y-1">
                      {assetIds.map((assetId) => (
                        <div
                          key={assetId}
                          className="flex items-center justify-between rounded bg-slate-700/50 p-2"
                        >
                          <code className="text-sm text-slate-300">#{assetId}</code>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              window.open(
                                getExplorerUrl(assetId.toString(), NETWORK),
                                '_blank'
                              )
                            }
                          >
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {txIds.length > 0 && (
                    <div>
                      <p className="mb-2 text-sm font-semibold text-slate-300">
                        Transaction{txIds.length > 1 ? 's' : ''}:
                      </p>
                      <div className="space-y-1">
                        {txIds.map((txId) => (
                          <div
                            key={txId}
                            className="flex items-center justify-between rounded bg-slate-700/50 p-2"
                          >
                            <code className="text-xs text-slate-400 font-mono">
                              {txId.slice(0, 8)}...
                            </code>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                window.open(getExplorerUrl(txId, NETWORK), '_blank')
                              }
                            >
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={onClose}>
                  Close
                </Button>
                <Button
                  variant="primary"
                  className="flex-1"
                  onClick={() => {
                    // Navigate to My Tickets
                    onClose()
                  }}
                >
                  View My Tickets
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Modal>
  )
}

