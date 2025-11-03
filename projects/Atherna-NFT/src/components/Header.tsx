import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Menu, X, Wallet } from 'lucide-react'
import { Button } from './ui/Button'
import { useWallet } from '@txnlab/use-wallet-react'

interface HeaderProps {
  onConnectWallet?: () => void
  onNavigateToEvents?: () => void
}

export function Header({ onConnectWallet, onNavigateToEvents }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { activeAddress } = useWallet()

  const navItems = [
    { label: 'Browse Events', action: onNavigateToEvents },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Features', href: '#features' },
    { label: 'FAQ', href: '#faq' },
  ]

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-lg border-b border-slate-800/50"
    >
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-3 cursor-pointer"
            onClick={onNavigateToEvents}
          >
            <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-2xl md:text-3xl font-bold text-white">A</span>
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-bold text-white">Atherna</h1>
              <p className="text-xs text-slate-400 hidden sm:block">NFT Tickets</p>
            </div>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={item.action}
                className="text-slate-300 hover:text-white transition-colors font-medium text-sm"
              >
                {item.label}
              </a>
            ))}
            <Button
              variant="primary"
              size="sm"
              onClick={onConnectWallet}
              className="flex items-center gap-2"
            >
              <Wallet className="w-4 h-4" />
              {activeAddress ? (
                <span className="text-xs">
                  {activeAddress.slice(0, 6)}...{activeAddress.slice(-4)}
                </span>
              ) : (
                'Connect Wallet'
              )}
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        <motion.div
          initial={false}
          animate={{
            height: mobileMenuOpen ? 'auto' : 0,
            opacity: mobileMenuOpen ? 1 : 0,
          }}
          transition={{ duration: 0.3 }}
          className="md:hidden overflow-hidden"
        >
          <div className="py-4 space-y-3 border-t border-slate-800/50">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => {
                  item.action?.()
                  setMobileMenuOpen(false)
                }}
                className="block text-slate-300 hover:text-white transition-colors py-2"
              >
                {item.label}
              </a>
            ))}
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                onConnectWallet?.()
                setMobileMenuOpen(false)
              }}
              className="w-full flex items-center justify-center gap-2 mt-4"
            >
              <Wallet className="w-4 h-4" />
              {activeAddress ? (
                <span className="text-xs">
                  {activeAddress.slice(0, 6)}...{activeAddress.slice(-4)}
                </span>
              ) : (
                'Connect Wallet'
              )}
            </Button>
          </div>
        </motion.div>
      </nav>
    </motion.header>
  )
}

