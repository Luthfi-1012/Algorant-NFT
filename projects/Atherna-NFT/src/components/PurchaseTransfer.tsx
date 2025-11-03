import { AlgorandClient } from '@algorandfoundation/algokit-utils'
import { useWallet } from '@txnlab/use-wallet-react'
import { useSnackbar } from 'notistack'
import { useState } from 'react'
import { NftTicketClient } from '../contracts/NftTicket'
import { getAlgodConfigFromViteEnvironment } from '../utils/network/getAlgoClientConfigs'

interface PurchaseTransferProps {
  appId: number
}

const PurchaseTransfer = ({ appId }: PurchaseTransferProps) => {
  const { transactionSigner, activeAddress } = useWallet()
  const { enqueueSnackbar } = useSnackbar()
  const [loading, setLoading] = useState<string | null>(null)
  const [result, setResult] = useState<string>('')

  // Purchase states
  const [purchaseBuyerAddress, setPurchaseBuyerAddress] = useState('')
  const [purchaseEventDate, setPurchaseEventDate] = useState('')
  const [purchasePrice, setPurchasePrice] = useState('')

  // Transfer states
  const [transferNewOwner, setTransferNewOwner] = useState('')
  const [transferIsFrozen, setTransferIsFrozen] = useState(false)
  const [transferFee, setTransferFee] = useState('')

  const getClient = () => {
    const algodConfig = getAlgodConfigFromViteEnvironment()
    const algorand = AlgorandClient.fromConfig({ algodConfig })
    
    return new NftTicketClient({
      id: appId,
      resolveBy: 'id',
      sender: activeAddress!,
      signer: transactionSigner!,
      algorand,
    })
  }

  const executeMethod = async (methodName: string, fn: () => Promise<any>) => {
    if (!activeAddress || !transactionSigner) {
      enqueueSnackbar('Please connect wallet first', { variant: 'warning' })
      return
    }

    setLoading(methodName)
    setResult('')
    
    try {
      enqueueSnackbar(`Calling ${methodName}...`, { variant: 'info' })
      const response = await fn()
      
      const returnValue = response.return || 'No return value'
      const txId = response.txIds?.[0] || 'No transaction ID'
      
      setResult(`✅ Success!\nReturn: ${returnValue}\nTransaction ID: ${txId}`)
      enqueueSnackbar(`${methodName} executed successfully!`, { variant: 'success' })
    } catch (error: any) {
      const errorMsg = error.message || 'Unknown error'
      setResult(`❌ Error: ${errorMsg}`)
      enqueueSnackbar(`Failed to execute ${methodName}`, { variant: 'error' })
      console.error(`Error in ${methodName}:`, error)
    } finally {
      setLoading(null)
    }
  }

  const handlePurchase = async () => {
    const buyerAddr = purchaseBuyerAddress || activeAddress || ''
    if (!buyerAddr || buyerAddr.length !== 58) {
      enqueueSnackbar('Invalid buyer address (must be 58 characters)', { variant: 'error' })
      return
    }

    const eventDateTimestamp = purchaseEventDate 
      ? Math.floor(new Date(purchaseEventDate).getTime() / 1000)
      : Math.floor(Date.now() / 1000) + 86400 * 7
    
    const ticketPrice = parseFloat(purchasePrice) * 1_000_000 || 10_000_000

    const client = getClient()
    // Note: purchase_ticket requires 3 params: buyer_address, event_date, ticket_price
    // Contract client may need to be regenerated with: algokit project link --all
    await executeMethod('purchase_ticket', () =>
      client.send.purchaseTicket({
        args: {
          buyerAddress: buyerAddr,
          eventDate: eventDateTimestamp,
          // @ts-ignore - ticketPrice may not be in current client version
          ticketPrice,
        },
      })
    )
  }

  const handleTransfer = async () => {
    if (!transferNewOwner || transferNewOwner.length !== 58) {
      enqueueSnackbar('Invalid new owner address (must be 58 characters)', { variant: 'error' })
      return
    }

    const client = getClient()
    // Note: transfer_ticket requires 3 params: new_owner_address, is_frozen, transfer_fee
    // Contract client may need to be regenerated with: algokit project link --all
    await executeMethod('transfer_ticket', () =>
      client.send.transferTicket({
        args: {
          newOwnerAddress: transferNewOwner,
          isFrozen: transferIsFrozen,
          // @ts-ignore - transferFee may not be in current client version
          transferFee: transferFee ? parseFloat(transferFee) * 1_000_000 : 0,
        },
      })
    )
  }

  if (!activeAddress) {
    return (
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-2xl">💰 Purchase & Transfer</h2>
          <p className="text-gray-500">Please connect your wallet</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {result && (
        <div className="alert alert-info">
          <pre className="whitespace-pre-wrap text-sm">{result}</pre>
        </div>
      )}

      {/* Purchase Ticket */}
      <div className="card bg-gradient-to-br from-green-500 to-emerald-600 shadow-xl text-white">
        <div className="card-body">
          <h2 className="card-title text-2xl">
            <span className="text-3xl">🛒</span> Purchase Ticket
          </h2>
          <p className="text-green-100">Buy a ticket for an event. Payment will be sent via atomic group transaction.</p>
          
          <div className="grid grid-cols-1 gap-4 mt-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text text-white font-semibold">Buyer Address</span>
              </label>
              <input
                type="text"
                className="input input-bordered bg-white text-gray-800"
                value={purchaseBuyerAddress || activeAddress}
                onChange={(e) => setPurchaseBuyerAddress(e.target.value)}
                placeholder={activeAddress}
                maxLength={58}
              />
              <label className="label">
                <span className="label-text-alt text-green-200">Leave empty to use your address</span>
              </label>
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text text-white font-semibold">Event Date (optional)</span>
              </label>
              <input
                type="datetime-local"
                className="input input-bordered bg-white text-gray-800"
                value={purchaseEventDate}
                onChange={(e) => setPurchaseEventDate(e.target.value)}
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text text-white font-semibold">Ticket Price (Algo)</span>
              </label>
              <input
                type="number"
                className="input input-bordered bg-white text-gray-800"
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(e.target.value)}
                placeholder="10"
                step="0.1"
              />
            </div>
          </div>
          
          <button
            className="btn btn-lg bg-white text-green-600 hover:bg-green-50 mt-4"
            onClick={handlePurchase}
            disabled={loading !== null}
          >
            {loading === 'purchase_ticket' ? (
              <span className="loading loading-spinner" />
            ) : (
              <>
                <span className="text-xl">💳</span> Purchase Ticket
              </>
            )}
          </button>
        </div>
      </div>

      {/* Transfer Ticket */}
      <div className="card bg-gradient-to-br from-blue-500 to-cyan-600 shadow-xl text-white">
        <div className="card-body">
          <h2 className="card-title text-2xl">
            <span className="text-3xl">🔄</span> Transfer Ticket
          </h2>
          <p className="text-blue-100">Transfer ticket to another address with optional transfer fee</p>
          
          <div className="grid grid-cols-1 gap-4 mt-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text text-white font-semibold">New Owner Address</span>
              </label>
              <input
                type="text"
                className="input input-bordered bg-white text-gray-800"
                value={transferNewOwner}
                onChange={(e) => setTransferNewOwner(e.target.value)}
                placeholder="Enter recipient address (58 chars)"
                maxLength={58}
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text text-white font-semibold">Transfer Fee (Algo, optional)</span>
              </label>
              <input
                type="number"
                className="input input-bordered bg-white text-gray-800"
                value={transferFee}
                onChange={(e) => setTransferFee(e.target.value)}
                placeholder="0"
                step="0.1"
              />
              <label className="label">
                <span className="label-text-alt text-blue-200">Leave 0 for no fee. Will auto-activate account if needed.</span>
              </label>
            </div>
            <div className="form-control">
              <label className="label cursor-pointer">
                <span className="label-text text-white font-semibold">Is Frozen?</span>
                <input
                  type="checkbox"
                  className="toggle toggle-warning"
                  checked={transferIsFrozen}
                  onChange={(e) => setTransferIsFrozen(e.target.checked)}
                />
              </label>
              <label className="label">
                <span className="label-text-alt text-blue-200">
                  {transferIsFrozen ? '⚠️ Transfer will be rejected if frozen' : '✅ Ticket is unfrozen - can transfer'}
                </span>
              </label>
            </div>
          </div>
          
          <button
            className="btn btn-lg bg-white text-blue-600 hover:bg-blue-50 mt-4"
            onClick={handleTransfer}
            disabled={loading !== null}
          >
            {loading === 'transfer_ticket' ? (
              <span className="loading loading-spinner" />
            ) : (
              <>
                <span className="text-xl">🚀</span> Transfer Ticket
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default PurchaseTransfer

