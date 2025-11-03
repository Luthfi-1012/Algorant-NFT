import { useWallet } from '@txnlab/use-wallet-react'
import { useMemo } from 'react'
import { ellipseAddress } from '../utils/ellipseAddress'
import { getAlgodConfigFromViteEnvironment } from '../utils/network/getAlgoClientConfigs'
import { ExternalLink, Copy, Check } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

const Account = () => {
  const { activeAddress } = useWallet()
  const [copied, setCopied] = useState(false)
  const algoConfig = getAlgodConfigFromViteEnvironment()

  const networkName = useMemo(() => {
    return algoConfig.network === '' ? 'localnet' : algoConfig.network.toLocaleLowerCase()
  }, [algoConfig.network])

  const handleCopy = async () => {
    if (activeAddress) {
      try {
        await navigator.clipboard.writeText(activeAddress)
        setCopied(true)
        toast.success('Address copied to clipboard!')
        setTimeout(() => setCopied(false), 2000)
      } catch (err) {
        toast.error('Failed to copy address')
      }
    }
  }

  return (
    <div className="space-y-3">
      <div>
        <label className="text-xs text-slate-400 mb-1 block">Wallet Address</label>
        <div className="flex items-center gap-2">
          <code className="flex-1 px-3 py-2 bg-slate-900 rounded-lg text-sm text-purple-300 font-mono">
            {ellipseAddress(activeAddress)}
          </code>
          <button
            onClick={handleCopy}
            className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white transition-colors"
            title="Copy address"
          >
            {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>
      <div>
        <label className="text-xs text-slate-400 mb-1 block">Network</label>
        <div className="px-3 py-2 bg-slate-900 rounded-lg">
          <span className="text-sm font-semibold text-white capitalize">{networkName}</span>
        </div>
      </div>
      <a
        target="_blank"
        rel="noopener noreferrer"
        href={`https://lora.algokit.io/${networkName}/account/${activeAddress}/`}
        className="flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 transition-colors"
      >
        <ExternalLink className="w-4 h-4" />
        View on AlgoKit Explorer
      </a>
    </div>
  )
}

export default Account
