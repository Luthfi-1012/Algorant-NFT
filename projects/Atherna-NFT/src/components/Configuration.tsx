import { AlgorandClient } from '@algorandfoundation/algokit-utils'
import { useWallet } from '@txnlab/use-wallet-react'
import { useSnackbar } from 'notistack'
import { useState } from 'react'
import { Settings, Diamond, Info } from 'lucide-react'
import { NftTicketClient } from '../contracts/NftTicket'
import { getAlgodConfigFromViteEnvironment } from '../utils/network/getAlgoClientConfigs'

interface ConfigurationProps {
  appId: number
}

const Configuration = ({ appId }: ConfigurationProps) => {
  const { transactionSigner, activeAddress } = useWallet()
  const { enqueueSnackbar } = useSnackbar()
  const [loading, setLoading] = useState<string | null>(null)
  const [result, setResult] = useState<string>('')
  const [newRoyalty, setNewRoyalty] = useState('500')

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

  const handleUpdateRoyalty = async () => {
    const royaltyBasisPoints = parseInt(newRoyalty)
    
    if (royaltyBasisPoints > 10000) {
      enqueueSnackbar('Royalty cannot exceed 100% (10000 basis points)', { variant: 'error' })
      return
    }

    const client = getClient()
    await executeMethod('update_royalty', () =>
      client.send.updateRoyalty({
        args: {
          newRoyalty: royaltyBasisPoints,
        },
      })
    )
  }

  if (!activeAddress) {
    return (
      <div className="relative bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl shadow-purple-500/10">
        <div className="text-center">
          <Settings className="w-12 h-12 mx-auto mb-4 text-purple-400" />
          <h2 className="text-2xl font-bold text-white mb-2">Configuration</h2>
          <p className="text-slate-400">Please connect your wallet</p>
        </div>
      </div>
    )
  }

  const royaltyPercentage = (parseInt(newRoyalty) || 0) / 100

  return (
    <div className="space-y-6">
      {result && (
        <div className="relative bg-slate-900/50 backdrop-blur-xl border border-cyan-500/30 rounded-xl p-4 shadow-lg">
          <pre className="whitespace-pre-wrap text-sm text-white">{result}</pre>
        </div>
      )}

      {/* Update Royalty Section */}
      <div className="relative bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl shadow-purple-500/10 hover:border-purple-500/30 transition-all duration-300">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-purple-500/20 rounded-lg">
            <Settings className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Update Platform Royalty</h3>
            <p className="text-sm text-slate-400">
              Global royalty rate for ticket sales (in basis points)
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="space-y-6">
          {/* Current Royalty Display */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-400">Current Royalty</span>
              <span className="text-2xl font-bold text-purple-400">{royaltyPercentage}% ({newRoyalty || 0} basis points)</span>
            </div>
          </div>

          {/* Input Field */}
          <div className="space-y-3">
            <label className="block">
              <span className="text-sm font-semibold text-slate-300 mb-2 block">
                New Royalty (Basis Points)
              </span>
              <input
                type="number"
                value={newRoyalty}
                onChange={(e) => setNewRoyalty(e.target.value)}
                min="0"
                max="10000"
                className="w-full bg-slate-800/50 border border-slate-600 rounded-lg px-4 py-3 text-white font-mono text-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all placeholder:text-slate-500"
                placeholder="Enter basis points (100 = 1%, 500 = 5%, 10000 = 100%)"
              />
            </label>
            
            {/* Helper Text */}
            <div className="flex items-start gap-2 text-xs text-slate-400">
              <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <p>
                100 = 1%, 500 = 5%, 1000 = 10%, 10000 = 100%
              </p>
            </div>
          </div>

          {/* Error Message */}
          {parseInt(newRoyalty) > 10000 && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
              <p className="text-sm text-red-400 font-semibold">
                ⚠️ Royalty cannot exceed 100% (10000 basis points)
              </p>
            </div>
          )}

          {/* Preview */}
          <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-purple-300">Preview</span>
              <span className="text-xl font-bold text-white">
                {royaltyPercentage}% <span className="text-sm text-slate-400">({newRoyalty || 0} basis points)</span>
              </span>
            </div>
          </div>

          {/* Update Button */}
          <button
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg shadow-purple-500/50 transition-all duration-300 flex items-center justify-center gap-2 group disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed disabled:shadow-none"
            onClick={handleUpdateRoyalty}
            disabled={loading !== null || parseInt(newRoyalty) > 10000 || !newRoyalty}
          >
            {loading === 'update_royalty' ? (
              <span className="animate-spin">⏳</span>
            ) : (
              <>
                <Diamond className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
                Update Royalty
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Configuration

