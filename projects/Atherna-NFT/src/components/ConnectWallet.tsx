import { useWallet, Wallet, WalletId } from '@txnlab/use-wallet-react'
import { useState } from 'react'
import { Modal } from './ui/Modal'
import { Button } from './ui/Button'
import Account from './Account'
import { Wallet as WalletIcon, LogOut } from 'lucide-react'
import { toast } from 'sonner'

interface ConnectWalletInterface {
  openModal: boolean
  closeModal: () => void
}

const ConnectWallet = ({ openModal, closeModal }: ConnectWalletInterface) => {
  const { wallets, activeAddress } = useWallet()
  const [connecting, setConnecting] = useState<string | null>(null)

  const isKmd = (wallet: Wallet) => wallet.id === WalletId.KMD

  const handleConnect = async (wallet: Wallet) => {
    setConnecting(wallet.id)
    try {
      await wallet.connect()
      toast.success(`Connected to ${isKmd(wallet) ? 'LocalNet Wallet' : wallet.metadata.name}`)
      closeModal()
    } catch (error: any) {
      console.error('Failed to connect wallet:', error)
      toast.error(`Failed to connect: ${error?.message || 'Unknown error'}`)
    } finally {
      setConnecting(null)
    }
  }

  const handleDisconnect = async () => {
    try {
      if (wallets) {
        const activeWallet = wallets.find((w) => w.isActive)
        if (activeWallet) {
          await activeWallet.disconnect()
          toast.success('Wallet disconnected')
          closeModal()
        } else {
          // Required for logout/cleanup of inactive providers
          localStorage.removeItem('@txnlab/use-wallet:v3')
          window.location.reload()
        }
      }
    } catch (error: any) {
      console.error('Failed to disconnect wallet:', error)
      toast.error(`Failed to disconnect: ${error?.message || 'Unknown error'}`)
    }
  }

  return (
    <Modal
      isOpen={openModal}
      onClose={closeModal}
      title="Wallet Connection"
      description={activeAddress ? 'Your wallet is connected' : 'Select a wallet provider to connect'}
      size="md"
    >
      <div className="space-y-4">
        {/* Connected Account Info */}
        {activeAddress && (
          <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm font-semibold text-green-400">Connected</span>
              </div>
            </div>
            <Account />
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDisconnect}
              className="mt-4 w-full flex items-center justify-center gap-2"
              data-test-id="logout"
            >
              <LogOut className="w-4 h-4" />
              Disconnect Wallet
            </Button>
          </div>
        )}

        {/* Wallet Options */}
        {!activeAddress && wallets && wallets.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm text-slate-400 mb-4">Choose your preferred wallet:</p>
            <div className="grid gap-3">
              {wallets.map((wallet) => (
                <button
                  key={`provider-${wallet.id}`}
                  type="button"
                  data-test-id={`${wallet.id}-connect`}
                  onClick={() => handleConnect(wallet)}
                  disabled={connecting === wallet.id}
                  className="flex items-center gap-4 p-4 rounded-lg border-2 border-slate-700 bg-slate-800/50 hover:border-purple-500/50 hover:bg-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  {!isKmd(wallet) && wallet.metadata.icon && (
                    <img
                      alt={`wallet_icon_${wallet.id}`}
                      src={wallet.metadata.icon}
                      className="w-10 h-10 object-contain rounded-lg bg-white/10 p-1"
                    />
                  )}
                  {isKmd(wallet) && (
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                      <WalletIcon className="w-6 h-6 text-white" />
                    </div>
                  )}
                  <div className="flex-1 text-left">
                    <p className="font-semibold text-white">
                      {isKmd(wallet) ? 'LocalNet Wallet' : wallet.metadata.name}
                    </p>
                    {wallet.metadata.shortName && (
                      <p className="text-xs text-slate-400">{wallet.metadata.shortName}</p>
                    )}
                  </div>
                  {connecting === wallet.id && (
                    <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                  )}
                  {!connecting && (
                    <div className="text-slate-400 group-hover:text-purple-400 transition-colors">
                      →
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {!activeAddress && (!wallets || wallets.length === 0) && (
          <div className="text-center py-8 text-slate-400">
            <WalletIcon className="w-12 h-12 mx-auto mb-4 text-slate-600" />
            <p>No wallet providers available</p>
            <p className="text-sm mt-2">Please check your wallet extensions</p>
          </div>
        )}
      </div>
    </Modal>
  )
}
export default ConnectWallet
