# Implementation Guide - Atherna NFT Tickets

## 📋 Overview

Upgrade plan untuk mengembangkan platform NFT Ticketing lengkap sesuai spesifikasi, menggunakan Vite + React (bukan Next.js untuk mempertahankan struktur existing).

**Smart Contract App ID:** 748999956  
**Network:** Algorand TestNet → MainNet Ready

## 🎯 Tech Stack

### Core
- ✅ Vite 5.0+ (tetap, bukan Next.js)
- ✅ React 18+ + TypeScript 5.0+
- ✅ TailwindCSS 3.4+ dengan custom config

### State Management
- ✅ Zustand (Global state)
- ✅ TanStack Query v5 (Server state & caching)

### Forms & Validation
- ✅ React Hook Form + Zod

### UI & Animation
- ✅ Framer Motion
- ✅ Lucide React (icons)

### Algorand Integration
- ✅ algosdk + @txnlab/use-wallet v3
- ✅ @algorandfoundation/algokit-utils
- ✅ Multi-wallet: Pera, Defly, Exodus

### Additional
- ✅ date-fns
- ✅ qrcode.react
- ✅ recharts
- ✅ sonner (toast notifications)
- ✅ clsx + tailwind-merge

## 📁 Folder Structure

```
src/
├── components/
│   ├── ui/              # Reusable UI components (Button, Card, Input, etc.)
│   ├── layout/           # Layout components (Header, Footer, Sidebar)
│   ├── features/         # Feature-specific components
│   │   ├── events/       # Event listing, detail, create
│   │   ├── tickets/      # My tickets, QR code, transfer
│   │   ├── purchase/     # Purchase flow modal
│   │   ├── refund/       # Refund request
│   │   └── dashboard/    # Organizer dashboard, admin panel
│   └── wallet/           # Wallet connection components
├── pages/                # Page components (Landing, Events, Dashboard)
├── hooks/                # Custom React hooks
├── stores/               # Zustand stores
├── lib/                  # Utilities & helpers
│   ├── api/              # API functions
│   ├── contracts/        # Contract interaction
│   ├── utils/            # General utilities
│   └── constants/        # Constants & config
├── types/                # TypeScript types
└── styles/               # Global styles & themes
```

## 🚀 Implementation Steps

### Phase 1: Setup Foundation (Current)
- [x] Install all dependencies
- [x] Setup Tailwind config
- [x] Create folder structure
- [ ] Setup TanStack Query provider
- [ ] Setup Zustand stores
- [ ] Create utility functions (cn, formatters)

### Phase 2: UI Components Library
- [ ] Button variants (Primary, Secondary, Ghost, Destructive, Outline)
- [ ] Card component
- [ ] Input components (Text, Number, Date, Select)
- [ ] Badge component
- [ ] Modal/Dialog component
- [ ] Toast/Notification system (sonner)
- [ ] Skeleton loading
- [ ] Pagination component

### Phase 3: Core Features
- [ ] Landing Page (Hero, Features, How it works, FAQ, Footer)
- [ ] Event Listing (Search, Filter, Sort, Pagination)
- [ ] Event Detail Page
- [ ] Purchase Flow Modal (4 steps)
- [ ] My Tickets Page
- [ ] QR Code Modal
- [ ] Transfer Ticket Modal
- [ ] Refund Request Modal

### Phase 4: Dashboard & Admin
- [ ] Organizer Dashboard (Stats cards, Charts, Events table)
- [ ] Create Event Form
- [ ] Admin Panel (Platform stats, All events, Actions)

### Phase 5: Integration & Polish
- [ ] Integrate all smart contract methods
- [ ] Error handling & retry logic
- [ ] Performance optimization
- [ ] Responsive design testing
- [ ] Animation polish

## 🎨 Design System

### Colors (Tailwind Config)
```javascript
primary: '#9333ea' (purple-600)
pink: '#ec4899' (pink-600)
slate-900: '#0f172a' (background)
slate-800: '#1e293b' (card)
```

### Typography
- Font: Inter (Google Fonts)
- Headings: 48px, 36px, 24px, 20px
- Body: 18px, 16px, 14px
- Code: JetBrains Mono

### Animations
- Transitions: duration-300
- Framer Motion: Page fade + slide, Modal scale + fade
- Card hover: scale-[1.02], shadow-2xl
- Count up numbers, Confetti on success

## 🔧 Next Steps

1. **Setup TanStack Query Provider** di `App.tsx`
2. **Create Zustand stores** untuk global state
3. **Build UI component library** di `components/ui/`
4. **Implement Landing Page** dengan semua sections
5. **Build Event Listing** dengan search & filters
6. **Implement Purchase Flow** dengan atomic group transactions
7. **Create Dashboard** dengan stats & charts

## 📝 Notes

- Tetap menggunakan Vite (bukan Next.js) untuk kompatibilitas dengan struktur existing
- Semua fitur akan diimplementasi sesuai spesifikasi
- Smart contract methods sudah tersedia, tinggal integrasi
- Focus pada UX yang smooth dan performance yang baik

