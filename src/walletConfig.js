import { createAppKit } from '@reown/appkit/react'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { sepolia } from '@reown/appkit/networks'

// Your WalletConnect Project ID (get one free at https://cloud.walletconnect.com)
export const projectId = "4f3d97b9e633021b20748e19add508da"

// Configure Wagmi adapter with chains you want
export const wagmiAdapter = new WagmiAdapter({
  networks: [sepolia],
  projectId
})

// DApp metadata (what shows in wallet popup)
const metadata = {
  name: "Auction DApp",
  description: "A decentralized auction platform",
  url: "https://auction-d-app-wheat.vercel.app/", 
//   icons: ["https://your-icon-link.png"]
}

// Initialize AppKit (modal UI)
createAppKit({
  adapters: [wagmiAdapter],
  networks: [sepolia],
  metadata,
  projectId,
  features: {
    analytics: true
  }
})
