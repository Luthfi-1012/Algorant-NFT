import { AlgorandClient } from '@algorandfoundation/algokit-utils'
import { useWallet } from '@txnlab/use-wallet-react'
import { useSnackbar } from 'notistack'
import { useState } from 'react'
import { NftTicketClient } from '../contracts/NftTicket'
import { getAlgodConfigFromViteEnvironment } from '../utils/network/getAlgoClientConfigs'

interface EventManagementProps {
  appId: number
}

const EventManagement = ({ appId }: EventManagementProps) => {
  const { transactionSigner, activeAddress } = useWallet()
  const { enqueueSnackbar } = useSnackbar()
  const [loading, setLoading] = useState<string | null>(null)
  const [result, setResult] = useState<string>('')

  // Form states
  const [eventName, setEventName] = useState('')
  const [eventDate, setEventDate] = useState('')
  const [price, setPrice] = useState('')
  const [releaseDays, setReleaseDays] = useState('7')
  const [royalty, setRoyalty] = useState('500')
  
  // Get ticket info states
  const [infoEventName, setInfoEventName] = useState('')
  const [infoPrice, setInfoPrice] = useState('')
  const [infoIsFrozen, setInfoIsFrozen] = useState(false)

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

  const handleCreateEvent = async () => {
    if (!eventName || !eventDate || !price) {
      enqueueSnackbar('Please fill all required fields', { variant: 'warning' })
      return
    }

    const eventDateTimestamp = Math.floor(new Date(eventDate).getTime() / 1000)
    const priceMicroAlgos = parseFloat(price) * 1_000_000
    
    const client = getClient()
    await executeMethod('create_ticket_event', () =>
      client.send.createTicketEvent({
        args: {
          eventName,
          eventDateTimestamp,
          price: priceMicroAlgos,
          releaseDays: parseInt(releaseDays) || 7,
          royalty: parseInt(royalty) || 500,
        },
      })
    )
  }

  const handleGetTicketInfo = async () => {
    if (!infoEventName || !infoPrice) {
      enqueueSnackbar('Please fill all required fields', { variant: 'warning' })
      return
    }

    const client = getClient()
    await executeMethod('get_ticket_info', () =>
      client.send.getTicketInfo({
        args: {
          eventName: infoEventName,
          price: BigInt(infoPrice),
          isFrozen: infoIsFrozen,
        },
      })
    )
  }

  if (!activeAddress) {
    return (
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-2xl">📅 Event Management</h2>
          <p className="text-gray-500">Please connect your wallet to manage events</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Result Display */}
      {result && (
        <div className="alert alert-info">
          <pre className="whitespace-pre-wrap text-sm">{result}</pre>
        </div>
      )}

      {/* Create Event */}
      <div className="card bg-gradient-to-br from-purple-500 to-indigo-600 shadow-xl text-white">
        <div className="card-body">
          <h2 className="card-title text-2xl">
            <span className="text-3xl">🎫</span> Create Ticket Event
          </h2>
          <p className="text-purple-100">Create a new NFT ticket event for your show or concert</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text text-white font-semibold">Event Name</span>
              </label>
              <input
                type="text"
                className="input input-bordered bg-white text-gray-800"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                placeholder="Concert 2024"
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text text-white font-semibold">Event Date</span>
              </label>
              <input
                type="datetime-local"
                className="input input-bordered bg-white text-gray-800"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text text-white font-semibold">Price (Algo)</span>
              </label>
              <input
                type="number"
                className="input input-bordered bg-white text-gray-800"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="10"
                step="0.1"
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text text-white font-semibold">Release Days</span>
              </label>
              <input
                type="number"
                className="input input-bordered bg-white text-gray-800"
                value={releaseDays}
                onChange={(e) => setReleaseDays(e.target.value)}
                placeholder="7"
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text text-white font-semibold">Royalty (%)</span>
              </label>
              <input
                type="number"
                className="input input-bordered bg-white text-gray-800"
                value={royalty}
                onChange={(e) => setRoyalty(e.target.value)}
                placeholder="5"
                max="100"
              />
              <label className="label">
                <span className="label-text-alt text-purple-200">In basis points (500 = 5%)</span>
              </label>
            </div>
          </div>
          
          <button
            className="btn btn-lg bg-white text-purple-600 hover:bg-purple-50 mt-4"
            onClick={handleCreateEvent}
            disabled={loading !== null}
          >
            {loading === 'create_ticket_event' ? (
              <span className="loading loading-spinner" />
            ) : (
              <>
                <span className="text-xl">✨</span> Create Event
              </>
            )}
          </button>
        </div>
      </div>

      {/* Get Ticket Info */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">
            <span className="text-2xl">ℹ️</span> Get Ticket Information
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Event Name</span>
              </label>
              <input
                type="text"
                className="input input-bordered"
                value={infoEventName}
                onChange={(e) => setInfoEventName(e.target.value)}
                placeholder="Concert 2024"
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Price (microAlgos)</span>
              </label>
              <input
                type="number"
                className="input input-bordered"
                value={infoPrice}
                onChange={(e) => setInfoPrice(e.target.value)}
                placeholder="10000000"
              />
            </div>
            <div className="form-control">
              <label className="label cursor-pointer">
                <span className="label-text font-semibold">Is Frozen?</span>
                <input
                  type="checkbox"
                  className="toggle toggle-primary"
                  checked={infoIsFrozen}
                  onChange={(e) => setInfoIsFrozen(e.target.checked)}
                />
              </label>
            </div>
          </div>
          
          <button
            className="btn btn-primary mt-4"
            onClick={handleGetTicketInfo}
            disabled={loading !== null}
          >
            {loading === 'get_ticket_info' ? (
              <span className="loading loading-spinner" />
            ) : (
              'Get Info'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default EventManagement

