/**
 * Ticket Types
 */

export interface Ticket {
  assetId: number
  eventId: string
  eventName: string
  eventDate: number
  price: number // in microAlgos
  purchaseDate: number
  ownerAddress: string
  isFrozen: boolean
  freezeReleaseDate?: number
  category?: string
  venue?: string
  location?: string
  imageUrl?: string
}

export type TicketFilter = 'all' | 'upcoming' | 'past' | 'transferable'

