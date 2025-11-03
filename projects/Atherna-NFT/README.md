# Atherna NFT Ticket Event Platform

Frontend modern untuk NFT Ticket Event Platform di Algorand blockchain menggunakan React, TypeScript, dan AlgoKit.

## 🚀 Fitur

### 📅 Event Management
- **Create Ticket Event**: Buat event NFT ticket baru dengan informasi lengkap
- **Get Ticket Info**: Lihat informasi ticket event

### 💰 Purchase & Transfer
- **Purchase Ticket**: Beli ticket dengan payment via atomic group transaction
- **Transfer Ticket**: Transfer ticket ke address lain dengan optional transfer fee

### ❄️ Freeze Management
- **Check Freeze Status**: Cek status freeze ticket berdasarkan event date
- **Emergency Freeze**: Freeze ticket secara darurat
- **Release Freeze**: Release freeze secara manual

### 💸 Refund Management
- **Refund Ticket**: Refund ticket sebelum deadline (normal refund)
- **Emergency Refund**: Refund darurat saat event dibatalkan (tanpa deadline)

### ⚙️ Configuration
- **Update Royalty**: Update royalty rate untuk ticket sales

## 📋 Prerequisites

- Node.js >= 20.0
- npm >= 9.0
- AlgoKit CLI
- Smart contract NftTicket sudah di-deploy

## 🛠️ Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Generate contract client:**
   ```bash
   npm run generate:app-clients
   ```
   Atau:
   ```bash
   algokit project link --all
   ```

3. **Setup environment variables:**
   Buat file `.env` di root directory dengan konfigurasi berikut:
   ```env
   VITE_ALGOD_SERVER=https://testnet-api.algonode.cloud
   VITE_ALGOD_PORT=443
   VITE_ALGOD_TOKEN=
   VITE_ALGOD_NETWORK=testnet
   VITE_APP_ID=<YOUR_DEPLOYED_APP_ID>
   ```

   Untuk localnet:
   ```env
   VITE_ALGOD_SERVER=http://localhost
   VITE_ALGOD_PORT=4001
   VITE_ALGOD_TOKEN=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
   VITE_ALGOD_NETWORK=localnet
   VITE_KMD_SERVER=http://localhost
   VITE_KMD_PORT=4002
   VITE_KMD_TOKEN=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
   VITE_KMD_WALLET=unencrypted-default-wallet
   VITE_KMD_PASSWORD=
   VITE_APP_ID=<YOUR_DEPLOYED_APP_ID>
   ```

4. **Run development server:**
   ```bash
   npm run dev
   ```

5. **Build for production:**
   ```bash
   npm run build
   ```

## 📝 Catatan Penting

### Regenerasi Contract Client
Jika smart contract sudah di-update (misalnya menambahkan method `refund_ticket` atau `cancel_event_refund`), pastikan untuk regenerate contract client:

```bash
cd ../Algorand_nft/smart_contracts
algokit project link --all
```

Atau dari root frontend:
```bash
npm run generate:app-clients
```

### Method Parameters Update
Beberapa method memerlukan parameter tambahan yang mungkin belum ada di contract client yang lama:

1. **purchase_ticket**: Memerlukan 3 parameter:
   - `buyer_address` (address)
   - `event_date` (uint64)
   - `ticket_price` (uint64)

2. **transfer_ticket**: Memerlukan 3 parameter:
   - `new_owner_address` (address)
   - `is_frozen` (bool)
   - `transfer_fee` (uint64)

3. **refund_ticket**: Memerlukan 5 parameter:
   - `buyer_address` (address)
   - `refund_amount` (uint64)
   - `event_date` (uint64)
   - `current_time` (uint64)
   - `refund_deadline_days` (uint64)

4. **cancel_event_refund**: Memerlukan 4 parameter:
   - `buyer_address` (address)
   - `refund_amount` (uint64)
   - `event_date` (uint64)
   - `current_time` (uint64)

## 🎨 Design

Frontend menggunakan:
- **Tailwind CSS** untuk styling
- **DaisyUI** untuk komponen UI
- **Gradient backgrounds** dengan tema purple-pink
- **Modern card-based layout**
- **Responsive design**

## 🔗 Wallet Integration

Frontend mendukung wallet berikut:
- **Pera Wallet** (Mainnet/Testnet)
- **Defly Wallet** (Mainnet/Testnet)
- **Exodus Wallet** (Mainnet/Testnet)
- **KMD Wallet** (Localnet only)

## 📱 Struktur Aplikasi

```
src/
├── components/
│   ├── ConnectWallet.tsx      # Modal koneksi wallet
│   ├── EventManagement.tsx     # Komponen event management
│   ├── PurchaseTransfer.tsx    # Komponen purchase & transfer
│   ├── FreezeManagement.tsx    # Komponen freeze management
│   ├── RefundManagement.tsx    # Komponen refund management
│   ├── Configuration.tsx      # Komponen configuration
│   ├── Account.tsx             # Display account info
│   ├── Transact.tsx            # Transaction demo
│   └── ErrorBoundary.tsx       # Error handling
├── contracts/
│   └── NftTicket.ts           # Auto-generated contract client
├── Home.tsx                    # Main page component
├── App.tsx                     # Root component
└── styles/
    └── App.css                 # Custom styles
```

## 🐛 Troubleshooting

### Error: Method tidak ditemukan
Jika mendapatkan error bahwa method tidak ditemukan di contract client:
1. Pastikan smart contract sudah di-update
2. Regenerate contract client: `algokit project link --all`
3. Restart development server

### Error: Invalid APP_ID
Jika mendapatkan warning tentang APP_ID:
1. Pastikan `VITE_APP_ID` sudah di-set di `.env`
2. Pastikan App ID adalah angka yang valid

### Error: Wallet tidak connect
1. Pastikan wallet extension sudah terinstall
2. Pastikan network di wallet sesuai dengan `.env`
3. Coba refresh halaman dan connect ulang

## 📄 License

MIT
