import { AlgorandClient } from '@algorandfoundation/algokit-utils'
import { useWallet } from '@txnlab/use-wallet-react'
import { useSnackbar } from 'notistack'
import { useState } from 'react'
import { Search, Lock, Unlock, AlertTriangle, AlertCircle, Calendar } from 'lucide-react'
import { NftTicketClient } from '../contracts/NftTicket'
import { getAlgodConfigFromViteEnvironment } from '../utils/network/getAlgoClientConfigs'

interface FreezeManagementProps {
  appId: number
}

const FreezeManagement = ({ appId }: FreezeManagementProps) => {
  const { transactionSigner, activeAddress } = useWallet()
  const { enqueueSnackbar } = useSnackbar()
  const [loading, setLoading] = useState<string | null>(null)
  const [result, setResult] = useState<string>('')

  // Check freeze status states
  const [checkEventDate, setCheckEventDate] = useState('')
  const [checkReleaseDays, setCheckReleaseDays] = useState('7')
  const [checkCurrentTime, setCheckCurrentTime] = useState('')

  // Release freeze states
  const [releaseEventDate, setReleaseEventDate] = useState('')
  const [releaseCurrentTime, setReleaseCurrentTime] = useState('')
  const [releaseDays, setReleaseDays] = useState('7')
  
  // Emergency freeze confirmation
  const [emergencyConfirmed, setEmergencyConfirmed] = useState(false)
  
  // Freeze status result
  const [freezeStatusResult, setFreezeStatusResult] = useState<string | null>(null)

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

  const handleCheckFreezeStatus = async () => {
    const eventDateTimestamp = checkEventDate 
      ? Math.floor(new Date(checkEventDate).getTime() / 1000)
      : Math.floor(Date.now() / 1000) + 86400 * 7
    
    const currentTime = checkCurrentTime 
      ? Math.floor(new Date(checkCurrentTime).getTime() / 1000)
      : Math.floor(Date.now() / 1000)
    
    const client = getClient()
    await executeMethod('check_freeze_status', async () => {
      const response = await client.send.checkFreezeStatus({
        args: {
          eventDate: eventDateTimestamp,
          releaseDays: parseInt(checkReleaseDays) || 7,
          currentTime,
        },
      })
      setFreezeStatusResult(response.return || 'No status returned')
      return response
    })
  }

  const handleEmergencyFreeze = async () => {
    if (!emergencyConfirmed) {
      enqueueSnackbar('Please confirm that you understand the consequences', { variant: 'warning' })
      return
    }
    const client = getClient()
    await executeMethod('emergency_freeze', () => 
      client.send.emergencyFreeze()
    )
    setEmergencyConfirmed(false)
  }

  const handleReleaseFreeze = async () => {
    const eventDateTimestamp = releaseEventDate 
      ? Math.floor(new Date(releaseEventDate).getTime() / 1000)
      : Math.floor(Date.now() / 1000) + 86400 * 7
    
    const currentTime = releaseCurrentTime 
      ? Math.floor(new Date(releaseCurrentTime).getTime() / 1000)
      : Math.floor(Date.now() / 1000)
    
    const client = getClient()
    await executeMethod('release_freeze', () =>
      client.send.releaseFreeze({
        args: {
          eventDate: eventDateTimestamp,
          currentTime,
          releaseDays: parseInt(releaseDays) || 7,
        },
      })
    )
  }

  const currentUnixTime = Math.floor(Date.now() / 1000)

  if (!activeAddress) {
    return (
      <div className="relative bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl shadow-cyan-500/10">
        <div className="text-center">
          <Lock className="w-12 h-12 mx-auto mb-4 text-cyan-400" />
          <h2 className="text-2xl font-bold text-white mb-2">Freeze Management</h2>
          <p className="text-slate-400">Please connect your wallet</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {result && (
        <div className="relative bg-slate-900/50 backdrop-blur-xl border border-cyan-500/30 rounded-xl p-4 shadow-lg">
          <pre className="whitespace-pre-wrap text-sm text-white">{result}</pre>
        </div>
      )}

      {/* Check Freeze Status Section */}
      <div className="relative bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl shadow-cyan-500/10 hover:border-cyan-500/30 transition-all duration-300">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-cyan-500/20 rounded-lg">
            <Search className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Freeze Management</h3>
            <p className="text-sm text-slate-400">
              Check freeze status for specific events
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Event Date Input */}
            <div className="space-y-2">
              <label className="block">
                <span className="text-sm font-semibold text-slate-300 mb-2 block">
                  Event Date
                </span>
                <div className="relative">
                  <input
                    type="date"
                    value={checkEventDate}
                    onChange={(e) => setCheckEventDate(e.target.value)}
                    className="w-full bg-slate-800/50 border border-slate-600 rounded-lg px-4 py-3 pr-10 text-white focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all [color-scheme:dark]"
                  />
                  <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                </div>
              </label>
            </div>

            {/* Release Days Input */}
            <div className="space-y-2">
              <label className="block">
                <span className="text-sm font-semibold text-slate-300 mb-2 block">
                  Release Days Before Event
                </span>
                <input
                  type="number"
                  value={checkReleaseDays}
                  onChange={(e) => setCheckReleaseDays(e.target.value)}
                  min="1"
                  max="30"
                  className="w-full bg-slate-800/50 border border-slate-600 rounded-lg px-4 py-3 text-white font-mono focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                />
              </label>
            </div>
          </div>

          {/* Current Time Display */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-400">Current Time (Unix)</span>
              <span className="text-lg font-mono text-white">{currentUnixTime}</span>
            </div>
          </div>

          {/* Check Status Button */}
          <button
            className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg shadow-cyan-500/50 transition-all duration-300 flex items-center justify-center gap-2 disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed disabled:shadow-none"
            onClick={handleCheckFreezeStatus}
            disabled={loading !== null}
          >
            {loading === 'check_freeze_status' ? (
              <span className="animate-spin">⏳</span>
            ) : (
              <>
                <Search className="w-5 h-5" />
                Check Freeze Status
              </>
            )}
          </button>

          {/* Status Result */}
          {freezeStatusResult && (
            <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-500/20 rounded-lg">
                  <Lock className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <p className="font-bold text-white">Status Result</p>
                  <p className="text-sm text-slate-400">{freezeStatusResult}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Emergency Freeze Section */}
      <div className="relative bg-slate-900/50 backdrop-blur-xl border border-red-500/30 rounded-2xl p-6 shadow-2xl shadow-red-500/20 hover:border-red-500/50 transition-all duration-300">
        {/* Warning Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-red-500/20 rounded-lg animate-pulse">
            <AlertTriangle className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Emergency Freeze</h3>
            <p className="text-sm text-red-400 font-semibold">
              ⚠️ Use only in critical situations
            </p>
          </div>
        </div>

        {/* Warning Message */}
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
            <div className="space-y-2 text-sm text-slate-300">
              <p className="font-semibold text-white">This action will:</p>
              <ul className="list-disc list-inside space-y-1 text-slate-400">
                <li>Immediately freeze ALL tickets across all events</li>
                <li>Prevent any ticket transfers or sales</li>
                <li>Require manual release to restore functionality</li>
                <li>Send notifications to all ticket holders</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Confirmation Checkbox */}
        <label className="flex items-start gap-3 mb-6 cursor-pointer group">
          <input 
            type="checkbox" 
            checked={emergencyConfirmed}
            onChange={(e) => setEmergencyConfirmed(e.target.checked)}
            className="mt-1 w-5 h-5 bg-slate-800 border-2 border-slate-600 rounded checked:bg-red-600 checked:border-red-600 focus:ring-2 focus:ring-red-500/20 transition-all"
          />
          <span className="text-sm text-slate-300 group-hover:text-white transition-colors">
            I understand the consequences and want to proceed with emergency freeze
          </span>
        </label>

        {/* Emergency Freeze Button */}
        <button
          className="w-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-lg shadow-lg shadow-red-500/50 disabled:shadow-none transition-all duration-300 flex items-center justify-center gap-2 group"
          onClick={handleEmergencyFreeze}
          disabled={loading !== null || !emergencyConfirmed}
        >
          {loading === 'emergency_freeze' ? (
            <span className="animate-spin">⏳</span>
          ) : (
            <>
              <Lock className="w-5 h-5 group-hover:scale-110 transition-transform" />
              Emergency Freeze All Tickets
            </>
          )}
        </button>
      </div>

      {/* Release Freeze Section */}
      <div className="relative bg-slate-900/50 backdrop-blur-xl border border-green-500/30 rounded-2xl p-6 shadow-2xl shadow-green-500/10 hover:border-green-500/50 transition-all duration-300">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-green-500/20 rounded-lg">
            <Unlock className="w-5 h-5 text-green-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Release Freeze</h3>
            <p className="text-sm text-slate-400">
              Manually release ticket transfer freeze for specific events
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Event Date */}
            <div className="space-y-2">
              <label className="block">
                <span className="text-sm font-semibold text-slate-300 mb-2 block">
                  Event Date
                </span>
                <input
                  type="date"
                  value={releaseEventDate}
                  onChange={(e) => setReleaseEventDate(e.target.value)}
                  className="w-full bg-slate-800/50 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all [color-scheme:dark]"
                />
              </label>
            </div>

            {/* Current Time */}
            <div className="space-y-2">
              <label className="block">
                <span className="text-sm font-semibold text-slate-300 mb-2 block">
                  Current Time (Unix)
                </span>
                <input
                  type="number"
                  value={currentUnixTime}
                  readOnly
                  className="w-full bg-slate-800/30 border border-slate-700 rounded-lg px-4 py-3 text-slate-400 font-mono cursor-not-allowed"
                />
              </label>
            </div>

            {/* Release Days */}
            <div className="space-y-2">
              <label className="block">
                <span className="text-sm font-semibold text-slate-300 mb-2 block">
                  Release Days
                </span>
                <input
                  type="number"
                  value={releaseDays}
                  onChange={(e) => setReleaseDays(e.target.value)}
                  className="w-full bg-slate-800/50 border border-slate-600 rounded-lg px-4 py-3 text-white font-mono focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
                />
              </label>
            </div>
          </div>

          {/* Release Button */}
          <button
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg shadow-green-500/50 transition-all duration-300 flex items-center justify-center gap-2 group disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed disabled:shadow-none"
            onClick={handleReleaseFreeze}
            disabled={loading !== null}
          >
            {loading === 'release_freeze' ? (
              <span className="animate-spin">⏳</span>
            ) : (
              <>
                <Unlock className="w-5 h-5 group-hover:scale-110 transition-transform" />
                Release Freeze
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default FreezeManagement

