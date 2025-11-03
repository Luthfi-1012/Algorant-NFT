import { useWallet } from '@txnlab/use-wallet-react'
import React, { useState } from 'react'
import ConnectWallet from './components/ConnectWallet'
import EventManagement from './components/EventManagement'
import PurchaseTransfer from './components/PurchaseTransfer'
import FreezeManagement from './components/FreezeManagement'
import RefundManagement from './components/RefundManagement'
import Configuration from './components/Configuration'
import { LandingPage } from './pages/LandingPage'
import { EventListing } from './pages/EventListing'
import { EventDetail } from './pages/EventDetail'
import { MyTickets } from './pages/MyTickets'

interface HomeProps {}

const Home: React.FC<HomeProps> = () => {
  const [openWalletModal, setOpenWalletModal] = useState<boolean>(false)
  const [activeTab, setActiveTab] = useState<string>('landing')
  const [showLanding, setShowLanding] = useState<boolean>(true)
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)
  const { activeAddress } = useWallet()

  // You'll need to set this to your deployed app ID
  const APP_ID = parseInt(import.meta.env.VITE_APP_ID || '0')
  const network = import.meta.env.VITE_ALGOD_NETWORK || 'testnet'

  const toggleWalletModal = () => {
    setOpenWalletModal(!openWalletModal)
  }

  // Dashboard stats (placeholder - replace with real data)
  const dashboardStats = {
    totalEvents: 2,
    totalSold: 630,
    revenue: 1125,
    royaltyEarned: 45,
  }

  // Show landing page initially or when user clicks logo
  if (showLanding && activeTab === 'landing') {
    return (
      <LandingPage
        onConnectWallet={() => {
          setOpenWalletModal(true)
          setShowLanding(false)
          setActiveTab('organizer')
        }}
        onExploreEvents={() => {
          setShowLanding(false)
          setActiveTab('events')
        }}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      {/* Top Bar */}
      <div className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700/50 px-4 py-2">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button className="text-white/80 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <button className="text-white/80 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>
            <button className="text-white/80 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </button>
          </div>
          <div className="flex items-center gap-3">
            <button className="text-white/80 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            <button className="text-white/80 hover:text-white transition-colors text-sm">Copy</button>
            <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-colors">
              Publish
            </button>
            <button className="text-white/80 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="bg-gradient-to-r from-purple-800/90 via-purple-700/90 to-pink-600/90 backdrop-blur-sm px-4 py-6">
        <div className="container mx-auto max-w-7xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  setShowLanding(true)
                  setActiveTab('landing')
                }}
                className="w-16 h-16 bg-purple-900 rounded-xl flex items-center justify-center shadow-lg hover:scale-105 transition-transform cursor-pointer"
              >
                <span className="text-3xl font-bold text-pink-400">A</span>
              </button>
              <div>
                <h1 className="text-3xl font-bold text-white mb-1">Atherna NFT Tickets</h1>
                <p className="text-white/80 text-sm">Powered by Algorand</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="bg-green-500 hover:bg-green-600 text-white px-6 py-2.5 rounded-lg font-semibold transition-colors shadow-lg">
                {network === 'testnet' ? 'TestNet' : network === 'mainnet' ? 'MainNet' : 'LocalNet'}
              </button>
              <button
                onClick={toggleWalletModal}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2.5 rounded-lg font-semibold transition-colors shadow-lg flex items-center gap-2"
              >
                {activeAddress ? (
                  <>
                    <span className="text-green-400">●</span>
                    <span>Connected</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    <span>Connect Wallet</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-purple-900/50 backdrop-blur-sm px-4 py-4">
        <div className="container mx-auto max-w-7xl">
          <div className="flex gap-4">
            <button
              onClick={() => {
                setActiveTab('events')
                setShowLanding(false)
                setSelectedEventId(null)
              }}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === 'events'
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg'
                  : 'bg-transparent text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
              Browse Events
            </button>
            <button
              onClick={() => {
                setActiveTab('organizer')
                setShowLanding(false)
                setSelectedEventId(null)
              }}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === 'organizer'
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg'
                  : 'bg-transparent text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Organizer Dashboard
            </button>
            <button
              onClick={() => {
                setActiveTab('tickets')
                setShowLanding(false)
                setSelectedEventId(null)
              }}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === 'tickets'
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg'
                  : 'bg-transparent text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
              My Tickets
            </button>
            <button
              onClick={() => setActiveTab('admin')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === 'admin'
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg'
                  : 'bg-transparent text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Admin Panel
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 px-4 py-8">
        <div className="container mx-auto max-w-7xl">
          {/* Dashboard Stats Cards - Show only on Organizer Dashboard */}
          {activeTab === 'organizer' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Total Events Card */}
              <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
                <div className="relative z-10">
                  <p className="text-white/80 text-sm font-medium mb-2">Total Events</p>
                  <p className="text-white text-4xl font-bold">{dashboardStats.totalEvents}</p>
                </div>
                <div className="absolute top-4 right-4 text-white/30">
                  <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>

              {/* Total Sold Card */}
              <div className="bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
                <div className="relative z-10">
                  <p className="text-white/80 text-sm font-medium mb-2">Total Sold</p>
                  <p className="text-white text-4xl font-bold">{dashboardStats.totalSold}</p>
                </div>
                <div className="absolute top-4 right-4 text-white/30">
                  <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                  </svg>
                </div>
              </div>

              {/* Revenue Card */}
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
                <div className="relative z-10">
                  <p className="text-white/80 text-sm font-medium mb-2">Revenue</p>
                  <p className="text-white text-4xl font-bold">A {dashboardStats.revenue.toLocaleString()}</p>
                </div>
                <div className="absolute top-4 right-4 text-white/30">
                  <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>

              {/* Royalty Earned Card */}
              <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
                <div className="relative z-10">
                  <p className="text-white/80 text-sm font-medium mb-2">Royalty Earned</p>
                  <p className="text-white text-4xl font-bold">A {dashboardStats.royaltyEarned}</p>
                </div>
                <div className="absolute top-4 right-4 text-white/30">
                  <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
              </div>
            </div>
          )}

        {/* Tab Content */}
        <div className="fade-in">
          {selectedEventId ? (
            <EventDetail
              eventId={selectedEventId}
              onBack={() => setSelectedEventId(null)}
            />
          ) : activeTab === 'events' ? (
            <EventListing
              onEventClick={(eventId) => {
                setSelectedEventId(eventId)
              }}
            />
          ) : activeTab === 'organizer' ? (
              <div className="space-y-6">
                {APP_ID > 0 ? (
                  <>
                    <EventManagement appId={APP_ID} />
                    <PurchaseTransfer appId={APP_ID} />
                    <FreezeManagement appId={APP_ID} />
                    <RefundManagement appId={APP_ID} />
                    <Configuration appId={APP_ID} />
                  </>
                ) : (
                  <div className="bg-base-100/90 backdrop-blur-md rounded-2xl p-8 shadow-xl">
                    <div className="text-center">
                      <div className="text-6xl mb-4">⚠️</div>
                      <h2 className="text-2xl font-bold mb-4">App ID Not Configured</h2>
                      <p className="text-gray-600 mb-6">
                        Please set <code className="bg-gray-200 px-2 py-1 rounded">VITE_APP_ID</code> in your <code className="bg-gray-200 px-2 py-1 rounded">.env</code> file
                      </p>
                      {activeAddress ? (
                        <p className="text-sm text-gray-500">Connected: {activeAddress.slice(0, 8)}...{activeAddress.slice(-6)}</p>
                      ) : (
                        <button onClick={toggleWalletModal} className="btn btn-primary">
                          Connect Wallet First
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
          ) : activeTab === 'tickets' ? (
            <MyTickets />
          ) : activeTab === 'buyer' ? (
            <div className="space-y-6">
              {APP_ID > 0 ? (
                <>
                  <MyTickets />
                  <PurchaseTransfer appId={APP_ID} />
                  <RefundManagement appId={APP_ID} />
                </>
              ) : (
                <div className="bg-base-100/90 backdrop-blur-md rounded-2xl p-8 shadow-xl text-center">
                  <h2 className="text-2xl font-bold mb-4">Buyer Portal</h2>
                  <p className="text-gray-600">Please configure APP_ID to use this feature</p>
                </div>
              )}
            </div>
          ) : activeTab === 'admin' ? (
              <div className="space-y-6">
                {APP_ID > 0 ? (
                  <>
                  <Configuration appId={APP_ID} />
                  <FreezeManagement appId={APP_ID} />
                  <EventManagement appId={APP_ID} />
                </>
              ) : (
                <div className="bg-base-100/90 backdrop-blur-md rounded-2xl p-8 shadow-xl text-center">
                  <h2 className="text-2xl font-bold mb-4">Admin Panel</h2>
                  <p className="text-gray-600">Please configure APP_ID to use this feature</p>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
      </div>

      <ConnectWallet openModal={openWalletModal} closeModal={toggleWalletModal} />
    </div>
  )
}

export default Home
