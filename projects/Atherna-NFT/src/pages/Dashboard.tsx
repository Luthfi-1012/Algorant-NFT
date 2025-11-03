import React, { useState } from 'react'
import { Calendar, Ticket, Lock, Unlock, DollarSign, RefreshCw, AlertTriangle, User, Clock, TrendingUp, Wallet } from 'lucide-react'
import { useWallet } from '@txnlab/use-wallet-react'
import { OrganizerDashboard } from '../components/dashboard/OrganizerDashboard'
import { BuyerPortal } from '../components/dashboard/BuyerPortal'
import { AdminPanel } from '../components/dashboard/AdminPanel'
import ConnectWallet from '../components/ConnectWallet'
import { Button } from '../components/ui/Button'

export default function NftTicketingPlatform() {
  const [activeTab, setActiveTab] = useState('organizer')
  const [openWalletModal, setOpenWalletModal] = useState(false)
  const { activeAddress } = useWallet()

  const APP_ID = parseInt(import.meta.env.VITE_APP_ID || '0')
  const network = import.meta.env.VITE_ALGOD_NETWORK || 'testnet'

  const tabs = [
    { id: 'organizer', label: 'Organizer Dashboard', icon: User },
    { id: 'buyer', label: 'Buyer Portal', icon: Ticket },
    { id: 'admin', label: 'Admin Panel', icon: TrendingUp }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Header */}
      <header className="bg-black/30 backdrop-blur-md border-b border-purple-500/30 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-lg">
                <Ticket className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  NFT Ticketing
                </h1>
                <p className="text-xs text-purple-300">Powered by Algorand</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className={`px-4 py-2 rounded-lg border font-semibold text-sm ${
                network === 'testnet' 
                  ? 'bg-green-500/20 text-green-400 border-green-500/30'
                  : network === 'mainnet'
                  ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                  : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
              }`}>
                {network === 'testnet' ? 'TestNet' : network === 'mainnet' ? 'MainNet' : 'LocalNet'}
              </div>
              {activeAddress ? (
                <div className="bg-purple-600/20 text-purple-400 px-4 py-2 rounded-lg border border-purple-500/30 flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm font-semibold">
                    {activeAddress.slice(0, 6)}...{activeAddress.slice(-4)}
                  </span>
                </div>
              ) : (
                <Button
                  variant="primary"
                  onClick={() => setOpenWalletModal(true)}
                  className="flex items-center gap-2"
                >
                  <Wallet className="w-4 h-4" />
                  Connect Wallet
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-2 bg-black/30 p-2 rounded-xl backdrop-blur-sm">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                  : 'text-purple-300 hover:bg-white/5'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 pb-8">
        {activeTab === 'organizer' && <OrganizerDashboard appId={APP_ID} />}
        {activeTab === 'buyer' && <BuyerPortal appId={APP_ID} />}
        {activeTab === 'admin' && <AdminPanel appId={APP_ID} />}
      </div>

      <ConnectWallet openModal={openWalletModal} closeModal={() => setOpenWalletModal(false)} />
    </div>
  )
}

