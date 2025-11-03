import { AlgorandClient } from '@algorandfoundation/algokit-utils'
import { useWallet } from '@txnlab/use-wallet-react'
import { useSnackbar } from 'notistack'
import { useState } from 'react'
import { NftTicketClient } from '../contracts/NftTicket'
import { getAlgodConfigFromViteEnvironment } from '../utils/network/getAlgoClientConfigs'

interface RefundManagementProps {
  appId: number
}

const RefundManagement = ({ appId }: RefundManagementProps) => {
  const { transactionSigner, activeAddress } = useWallet()
  const { enqueueSnackbar } = useSnackbar()
  const [loading, setLoading] = useState<string | null>(null)
  const [result, setResult] = useState<string>('')

  // Refund normal states
  const [refundBuyerAddress, setRefundBuyerAddress] = useState('')
  const [refundAmount, setRefundAmount] = useState('')
  const [refundEventDate, setRefundEventDate] = useState('')
  const [refundDeadlineDays, setRefundDeadlineDays] = useState('7')

  // Emergency refund states
  const [emergencyBuyerAddress, setEmergencyBuyerAddress] = useState('')
  const [emergencyRefundAmount, setEmergencyRefundAmount] = useState('')
  const [emergencyEventDate, setEmergencyEventDate] = useState('')

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

  const handleRefund = async () => {
    if (!refundBuyerAddress || refundBuyerAddress.length !== 58) {
      enqueueSnackbar('Invalid buyer address (must be 58 characters)', { variant: 'error' })
      return
    }

    const now = Math.floor(Date.now() / 1000)
    const eventDateTimestamp = refundEventDate 
      ? Math.floor(new Date(refundEventDate).getTime() / 1000)
      : now + (60 * 86400) // Default: 60 hari dari sekarang
    
    const refundAmountMicroAlgos = parseFloat(refundAmount) * 1_000_000 || 10_000_000

    const client = getClient()
    // Note: refund_ticket method requires contract client to be regenerated
    // Run: algokit project link --all in the smart_contracts directory
    // @ts-ignore - refundTicket may not be in current client version
    await executeMethod('refund_ticket', () =>
      client.send.refundTicket({
        args: {
          buyerAddress: refundBuyerAddress,
          refundAmount: refundAmountMicroAlgos,
          eventDate: eventDateTimestamp,
          currentTime: now,
          refundDeadlineDays: parseInt(refundDeadlineDays) || 7,
        },
      })
    )
  }

  const handleEmergencyRefund = async () => {
    if (!emergencyBuyerAddress || emergencyBuyerAddress.length !== 58) {
      enqueueSnackbar('Invalid buyer address (must be 58 characters)', { variant: 'error' })
      return
    }

    const now = Math.floor(Date.now() / 1000)
    const eventDateTimestamp = emergencyEventDate 
      ? Math.floor(new Date(emergencyEventDate).getTime() / 1000)
      : now + (60 * 86400)

    const refundAmountMicroAlgos = parseFloat(emergencyRefundAmount) * 1_000_000 || 10_000_000

    const client = getClient()
    // Note: cancel_event_refund method requires contract client to be regenerated
    // Run: algokit project link --all in the smart_contracts directory
    // @ts-ignore - cancelEventRefund may not be in current client version
    await executeMethod('cancel_event_refund', () =>
      client.send.cancelEventRefund({
        args: {
          buyerAddress: emergencyBuyerAddress,
          refundAmount: refundAmountMicroAlgos,
          eventDate: eventDateTimestamp,
          currentTime: now,
        },
      })
    )
  }

  if (!activeAddress) {
    return (
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-2xl">💸 Refund Management</h2>
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

      {/* Normal Refund */}
      <div className="card bg-gradient-to-br from-orange-500 to-red-600 shadow-xl text-white">
        <div className="card-body">
          <h2 className="card-title text-2xl">
            <span className="text-3xl">💰</span> Refund Ticket
          </h2>
          <p className="text-orange-100">Normal refund before event. Must be before deadline.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text text-white font-semibold">Buyer Address</span>
              </label>
              <input
                type="text"
                className="input input-bordered bg-white text-gray-800"
                value={refundBuyerAddress}
                onChange={(e) => setRefundBuyerAddress(e.target.value)}
                placeholder={activeAddress}
                maxLength={58}
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text text-white font-semibold">Refund Amount (Algo)</span>
              </label>
              <input
                type="number"
                className="input input-bordered bg-white text-gray-800"
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
                placeholder="10"
                step="0.1"
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text text-white font-semibold">Event Date</span>
              </label>
              <input
                type="datetime-local"
                className="input input-bordered bg-white text-gray-800"
                value={refundEventDate}
                onChange={(e) => setRefundEventDate(e.target.value)}
              />
              <label className="label">
                <span className="label-text-alt text-orange-200">Leave empty for default (60 days from now)</span>
              </label>
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text text-white font-semibold">Refund Deadline Days</span>
              </label>
              <input
                type="number"
                className="input input-bordered bg-white text-gray-800"
                value={refundDeadlineDays}
                onChange={(e) => setRefundDeadlineDays(e.target.value)}
                placeholder="7"
              />
              <label className="label">
                <span className="label-text-alt text-orange-200">Days before event (recommended: 3-7)</span>
              </label>
            </div>
          </div>
          
          <button
            className="btn btn-lg bg-white text-orange-600 hover:bg-orange-50 mt-4"
            onClick={handleRefund}
            disabled={loading !== null}
          >
            {loading === 'refund_ticket' ? (
              <span className="loading loading-spinner" />
            ) : (
              <>
                <span className="text-xl">💸</span> Process Refund
              </>
            )}
          </button>
        </div>
      </div>

      {/* Emergency Refund */}
      <div className="card bg-gradient-to-br from-yellow-500 to-amber-600 shadow-xl text-white">
        <div className="card-body">
          <h2 className="card-title text-2xl">
            <span className="text-3xl">🚨</span> Emergency Refund
          </h2>
          <p className="text-yellow-100">Event cancellation refund. Can refund anytime, no deadline restriction.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text text-white font-semibold">Buyer Address</span>
              </label>
              <input
                type="text"
                className="input input-bordered bg-white text-gray-800"
                value={emergencyBuyerAddress}
                onChange={(e) => setEmergencyBuyerAddress(e.target.value)}
                placeholder={activeAddress}
                maxLength={58}
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text text-white font-semibold">Refund Amount (Algo)</span>
              </label>
              <input
                type="number"
                className="input input-bordered bg-white text-gray-800"
                value={emergencyRefundAmount}
                onChange={(e) => setEmergencyRefundAmount(e.target.value)}
                placeholder="10"
                step="0.1"
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text text-white font-semibold">Event Date (optional)</span>
              </label>
              <input
                type="datetime-local"
                className="input input-bordered bg-white text-gray-800"
                value={emergencyEventDate}
                onChange={(e) => setEmergencyEventDate(e.target.value)}
              />
            </div>
          </div>
          
          <button
            className="btn btn-lg bg-white text-yellow-600 hover:bg-yellow-50 mt-4"
            onClick={handleEmergencyRefund}
            disabled={loading !== null}
          >
            {loading === 'cancel_event_refund' ? (
              <span className="loading loading-spinner" />
            ) : (
              <>
                <span className="text-xl">🚨</span> Emergency Refund
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default RefundManagement

