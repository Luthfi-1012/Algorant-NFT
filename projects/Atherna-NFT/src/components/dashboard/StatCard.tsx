import React from 'react'
import { LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string
  icon: LucideIcon
  color: 'purple' | 'pink' | 'green' | 'blue'
}

export function StatCard({ title, value, icon: Icon, color }: StatCardProps) {
  const colorClasses = {
    purple: 'from-purple-600 to-purple-800',
    pink: 'from-pink-600 to-pink-800',
    green: 'from-green-600 to-green-800',
    blue: 'from-blue-600 to-blue-800'
  }

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color]} rounded-xl p-6 border border-white/10`}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm text-white/70">{title}</p>
        <Icon className="w-5 h-5 text-white/70" />
      </div>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  )
}

