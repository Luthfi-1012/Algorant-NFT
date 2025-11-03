import { SupportedWallet, WalletId, WalletManager, WalletProvider } from '@txnlab/use-wallet-react'
import { SnackbarProvider } from 'notistack'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import NftTicketingPlatform from './pages/Dashboard'
import { getAlgodConfigFromViteEnvironment, getKmdConfigFromViteEnvironment } from './utils/network/getAlgoClientConfigs'
import { QUERY_CONFIG } from './lib/constants'

let supportedWallets: SupportedWallet[]
if (import.meta.env.VITE_ALGOD_NETWORK === 'localnet') {
  const kmdConfig = getKmdConfigFromViteEnvironment()
  supportedWallets = [
    {
      id: WalletId.KMD,
      options: {
        baseServer: kmdConfig.server,
        token: String(kmdConfig.token),
        port: String(kmdConfig.port),
      },
    },
  ]
} else {
  supportedWallets = [
    { id: WalletId.DEFLY },
    { id: WalletId.PERA },
    { id: WalletId.EXODUS },
  ]
}

// Create TanStack Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: QUERY_CONFIG.staleTime,
      gcTime: QUERY_CONFIG.gcTime,
      refetchOnWindowFocus: QUERY_CONFIG.refetchOnWindowFocus,
      retry: QUERY_CONFIG.retry,
    },
  },
})

export default function App() {
  let algodConfig
  try {
    algodConfig = getAlgodConfigFromViteEnvironment()
  } catch (error: any) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
        <div className="bg-slate-800 rounded-2xl p-8 max-w-2xl text-center">
          <h1 className="text-3xl font-bold text-white mb-4">⚠️ Configuration Error</h1>
          <p className="text-slate-300 mb-6">
            Please set up your environment variables. Create a <code className="bg-slate-700 px-2 py-1 rounded">.env</code> file in the root directory with:
          </p>
          <pre className="bg-slate-900 p-4 rounded-lg text-left text-sm text-slate-300 mb-6 overflow-auto">
{`VITE_ALGOD_SERVER=https://testnet-api.algonode.cloud
VITE_ALGOD_PORT=443
VITE_ALGOD_TOKEN=
VITE_ALGOD_NETWORK=testnet
VITE_APP_ID=748999956`}
          </pre>
          <p className="text-sm text-red-400">
            {error?.message || 'Missing environment variables'}
          </p>
        </div>
      </div>
    )
  }

  const walletManager = new WalletManager({
    wallets: supportedWallets,
    defaultNetwork: algodConfig.network,
    networks: {
      [algodConfig.network]: {
        algod: {
          baseServer: algodConfig.server,
          port: algodConfig.port,
          token: String(algodConfig.token),
        },
      },
    },
    options: {
      resetNetwork: true,
    },
  })

  return (
    <QueryClientProvider client={queryClient}>
      <SnackbarProvider maxSnack={3}>
        <WalletProvider manager={walletManager}>
          <NftTicketingPlatform />
          <Toaster position="top-right" richColors />
        </WalletProvider>
      </SnackbarProvider>
    </QueryClientProvider>
  )
}
