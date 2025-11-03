import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Shield,
  Coins,
  Zap,
  ArrowRight,
  TrendingUp,
  Calendar,
  Activity,
  ShieldCheck,
  Plus,
  Ticket,
  Clock,
  Users,
  DollarSign,
  CheckCircle2,
  Star,
  Lock,
  Sparkles,
} from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Badge } from '../components/ui/Badge'
import { Header } from '../components/Header'
import { Footer } from '../components/Footer'

interface LandingPageProps {
  onConnectWallet: () => void
  onExploreEvents: () => void
}

export function LandingPage({ onConnectWallet, onExploreEvents }: LandingPageProps) {
  const [eventName, setEventName] = useState('')
  const [eventDate, setEventDate] = useState('')
  const [ticketPrice, setTicketPrice] = useState('')

  const features = [
    {
      icon: Shield,
      title: 'Anti-Scalping Protection',
      description:
        'Tickets are frozen until event date to prevent scalping and ensure fair pricing for everyone.',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Coins,
      title: 'Automatic Royalties',
      description:
        'Organizers earn royalties on every ticket resale, creating sustainable revenue streams.',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: Zap,
      title: 'Instant Verification',
      description:
        'Verify ticket authenticity instantly on-chain. No fake tickets, no hassles.',
      color: 'from-yellow-500 to-orange-500',
    },
  ]

  const stats = [
    { value: '10K+', label: 'Tickets Sold', icon: TrendingUp, color: 'text-blue-400' },
    { value: '500+', label: 'Events Created', icon: Calendar, color: 'text-purple-400' },
    { value: '99.9%', label: 'Uptime', icon: Activity, color: 'text-green-400' },
    { value: '0', label: 'Fake Tickets', icon: ShieldCheck, color: 'text-red-400' },
  ]

  const benefits = [
    {
      icon: Users,
      title: 'Safe & Secure',
      description: 'Blockchain-powered security ensures your tickets are always authentic',
    },
    {
      icon: Clock,
      title: 'Instant Processing',
      description: 'Get your NFT tickets instantly after purchase, no waiting time',
    },
    {
      icon: DollarSign,
      title: 'Fair Pricing',
      description: 'Anti-scalping protection keeps ticket prices fair for everyone',
    },
    {
      icon: CheckCircle2,
      title: 'Easy Transfer',
      description: 'Transfer tickets to friends or family with just a few clicks',
    },
  ]

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <Header onConnectWallet={onConnectWallet} onNavigateToEvents={onExploreEvents} />

      {/* Main Content */}
      <main className="pt-20 pb-16">
        {/* Hero Section */}
        <section id="hero" className="px-8 py-16 lg:py-24">
          <div className="mx-auto max-w-6xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mb-6"
              >
                <Badge variant="info" className="mb-4">
                  <Sparkles className="mr-2 h-3 w-3" />
                  Powered by Algorand Blockchain
                </Badge>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="mb-6 text-6xl font-bold text-white sm:text-7xl lg:text-8xl"
              >
                <span className="text-slate-400">NFT Ticket</span>{' '}
                <span className="inline-block rounded-lg bg-white px-4 py-2 text-slate-900 shadow-lg">
                  Atherna
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="mx-auto mb-10 max-w-2xl text-xl text-slate-400 sm:text-2xl"
              >
                Platform ticketing NFT terdesentralisasi di Algorand Network
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="flex flex-col items-center justify-center gap-4 sm:flex-row"
              >
                <Button
                  size="lg"
                  onClick={onExploreEvents}
                  className="group transform transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/50"
                >
                  <Ticket className="mr-2 h-5 w-5" />
                  Explore Events
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={onConnectWallet}
                  className="transform transition-all duration-300 hover:scale-105 hover:bg-white/10 hover:border-white/50"
                >
                  <Lock className="mr-2 h-5 w-5" />
                  Connect Wallet
                </Button>
              </motion.div>
            </motion.div>

            {/* Statistics Cards */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:mt-20"
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.7 + index * 0.1 }}
                  className="group rounded-xl border border-slate-700 bg-slate-800 p-6 text-center transition-all duration-300 hover:border-slate-600 hover:bg-slate-700 hover:scale-105 hover:shadow-lg"
                >
                  <div className="mb-3 flex justify-center">
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <div className="mb-2 text-3xl font-semibold text-white">{stat.value}</div>
                  <div className="text-sm font-medium text-slate-400">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Why Choose Atherna Section */}
        <section id="features" className="px-8 py-16 lg:py-20">
          <div className="mx-auto max-w-6xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-12 text-center lg:mb-16"
            >
              <h2 className="mb-4 text-4xl font-bold text-white sm:text-5xl lg:text-6xl">
                Why Choose Atherna?
              </h2>
              <p className="mx-auto max-w-2xl text-xl text-slate-400">
                Platform ticketing NFT yang dibangun di Algorand untuk kecepatan, keamanan, dan
                keberlanjutan
              </p>
            </motion.div>

            {/* Features in Card Grid */}
            <div className="grid gap-6 md:grid-cols-3">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ duration: 0.6, delay: index * 0.15 }}
                >
                  <Card
                    hover
                    className="group h-full rounded-xl border border-slate-700 bg-slate-800 transition-all duration-300 hover:border-purple-500/50 hover:bg-slate-700 hover:shadow-xl hover:shadow-purple-500/10"
                  >
                    <CardHeader>
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                        className={`mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-r ${feature.color} shadow-lg`}
                      >
                        <feature.icon className="h-7 w-7 text-white" />
                      </motion.div>
                      <CardTitle className="text-xl font-semibold text-white">
                        {feature.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-base leading-relaxed text-slate-400">
                        {feature.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section id="benefits" className="bg-slate-800/50 px-8 py-16 lg:py-20">
          <div className="mx-auto max-w-6xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-12 text-center"
            >
              <h2 className="mb-4 text-4xl font-bold text-white sm:text-5xl">Key Benefits</h2>
              <p className="mx-auto max-w-2xl text-xl text-slate-400">
                Everything you need for secure and seamless event ticketing
              </p>
            </motion.div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="rounded-lg border border-slate-700 bg-slate-800 p-6 text-center transition-all duration-300 hover:border-purple-500/50 hover:bg-slate-700 hover:shadow-lg"
                >
                  <div className="mb-4 flex justify-center">
                    <div className="rounded-lg bg-purple-500/20 p-3">
                      <benefit.icon className="h-6 w-6 text-purple-400" />
                    </div>
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-white">{benefit.title}</h3>
                  <p className="text-sm leading-relaxed text-slate-400">{benefit.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Create Event Section - Card Style */}
        <section id="create-event" className="px-8 py-16 lg:py-20">
          <div className="mx-auto max-w-6xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-12 text-center"
            >
              <h2 className="mb-4 text-4xl font-bold text-white sm:text-5xl">
                Buat Event Baru
              </h2>
              <p className="mx-auto max-w-2xl text-lg text-slate-400">
                Mulai kampanye event Anda dan capai target penjualan tiket
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="rounded-xl border border-slate-700 bg-slate-800 p-8 shadow-xl"
            >
              <div className="mb-8 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500 shadow-lg">
                  <Plus className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Form Pembuatan Event</h3>
                  <p className="text-sm text-slate-400">Isi form di bawah untuk membuat event baru</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <Input
                    label="Nama Event"
                    type="text"
                    placeholder="Contoh: Concert Jakarta, Tech Conference 2024"
                    value={eventName}
                    onChange={(e) => setEventName(e.target.value)}
                    helperText="Nama deskriptif untuk event Anda"
                  />
                </div>

                <div>
                  <Input
                    label="Tanggal Event"
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    helperText="Pilih tanggal pelaksanaan event"
                  />
                </div>

                <div>
                  <Input
                    label="Harga Tiket (ALGO)"
                    type="number"
                    placeholder="10"
                    value={ticketPrice}
                    onChange={(e) => setTicketPrice(e.target.value)}
                    helperText="Harga dalam ALGO untuk setiap tiket"
                  />
                </div>

                <div className="flex flex-col gap-4 pt-4 sm:flex-row">
                  <Button
                    size="lg"
                    onClick={onExploreEvents}
                    className="flex-1 transform transition-all duration-300 hover:scale-105"
                  >
                    Buat Event Sekarang
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={onConnectWallet}
                    className="flex-1 transform transition-all duration-300 hover:scale-105"
                  >
                    Connect Wallet Dulu
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section id="cta" className="bg-gradient-to-r from-purple-600 to-indigo-600 px-8 py-16 lg:py-20">
          <div className="mx-auto max-w-4xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="mb-4 text-4xl font-bold text-white sm:text-5xl">
                Siap Memulai?
              </h2>
              <p className="mb-8 text-xl text-white/90">
                Bergabunglah dengan ribuan pengguna yang sudah menggunakan Atherna untuk event mereka
              </p>
              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Button
                  size="lg"
                  variant="secondary"
                  onClick={onExploreEvents}
                  className="transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
                >
                  <Star className="mr-2 h-5 w-5" />
                  Jelajahi Event
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={onConnectWallet}
                  className="transform transition-all duration-300 hover:scale-105 hover:bg-white/10 hover:border-white/50"
                >
                  Connect Wallet
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}
