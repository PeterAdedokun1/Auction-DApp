import { useState, useEffect } from "react"
import { ethers } from "ethers"
import { useAccount, useDisconnect, useWalletClient } from "wagmi"
import { useAppKit } from "@reown/appkit/react"
import auctionArtifact from "./auctionABI.json"

const auctionABI = auctionArtifact.output.abi
const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS

export default function AuctionDapp() {
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const { data: walletClient } = useWalletClient()
  const { open } = useAppKit()

  const [highestBid, setHighestBid] = useState(0)
  const [highestBidder, setHighestBidder] = useState(null)
  const [bidAmount, setBidAmount] = useState("")
  const [bids, setBids] = useState([]) 
  const [refunds, setRefunds] = useState([]) 
  const [loading, setLoading] = useState(false) // 🟢 NEW: track tx status

  // Place bid
  async function placeBid() {
    if (!bidAmount) return alert("⚠️ Enter a bid amount")
    if (!walletClient) return alert("⚠️ Connect a wallet first")

    try {
      setLoading(true) // show loading state
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const contract = new ethers.Contract(CONTRACT_ADDRESS, auctionABI, signer)

      const tx = await contract.bid({ value: ethers.parseEther(bidAmount) })
      await tx.wait()

      alert("✅ Bid placed successfully!")
      setBidAmount("")

      fetchAuctionData()
      fetchBidHistory()
      fetchRefundHistory()
    } catch (error) {
      alert(`❌ ${error.message}`)
    } finally {
      setLoading(false) // reset loading state
    }
  }

  // Fetch auction data
  async function fetchAuctionData() {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum)
      const contract = new ethers.Contract(CONTRACT_ADDRESS, auctionABI, provider)

      const hb = await contract.highestBid()
      const hbr = await contract.highestBidder()

      setHighestBid(ethers.formatEther(hb))
      setHighestBidder(hbr)
    } catch (err) {
      console.error("Failed to fetch auction data:", err)
    }
  }

  // Fetch bid history
  async function fetchBidHistory() {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum)
      const contract = new ethers.Contract(CONTRACT_ADDRESS, auctionABI, provider)

      const filter = contract.filters.HighestBidIncreased()
      const logs = await contract.queryFilter(filter, 0, "latest")

      const parsedBids = logs.map((log) => ({
        bidder: log.args[0],
        amount: ethers.formatEther(log.args[1]),
      })).reverse()

      setBids(parsedBids)
    } catch (err) {
      console.error("Failed to fetch bid history:", err)
    }
  }

  // Fetch refund history
  async function fetchRefundHistory() {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum)
      const contract = new ethers.Contract(CONTRACT_ADDRESS, auctionABI, provider)

      const filter = contract.filters.BidRefunded()
      const logs = await contract.queryFilter(filter, 0, "latest")

      const parsedRefunds = logs.map((log) => ({
        bidder: log.args[0],
        amount: ethers.formatEther(log.args[1]),
      })).reverse()

      setRefunds(parsedRefunds)
    } catch (err) {
      console.error("Failed to fetch refund history:", err)
    }
  }

  useEffect(() => {
    fetchAuctionData()
    fetchBidHistory()
    fetchRefundHistory()
  }, [])

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Auction DApp</h1>

      {/* Wallet connect */}
      {!isConnected ? (
        <button onClick={() => open()}>Connect Wallet</button>
      ) : (
        <div>
          <p>Connected: {address}</p>
          <button onClick={disconnect}>Disconnect</button>
        </div>
      )}

      {/* Auction Info */}
      <div>
        <h3>Highest Bid: {highestBid} ETH</h3>
        <h3>Highest Bidder: {highestBidder || "None yet"}</h3>
      </div>

      {/* Bid Form */}
      <input
        type="text"
        placeholder="Enter ETH amount"
        value={bidAmount}
        onChange={(e) => setBidAmount(e.target.value)}
        style={{border: "none", outline: "1px solid gray", marginRight: 10, padding: 5, borderRadius: "5px"}}
      />
      <button onClick={placeBid} disabled={!isConnected || loading}>
        {loading ? "⏳ Processing..." : "Place Bid"}
      </button>

      {loading && <p>⏳ Waiting for transaction confirmation...</p>}

      {/* Bid History */}
      <div style={{ marginTop: "30px" }}>
        <h2>📜 Bid History</h2>
        {bids.length === 0 ? (
          <p>No bids yet</p>
        ) : (
          <table style={{ margin: "0 auto", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ border: "1px solid black", padding: "5px" }}>Bidder</th>
                <th style={{ border: "1px solid black", padding: "5px" }}>Amount (ETH)</th>
              </tr>
            </thead>
            <tbody>
              {bids.map((bid, idx) => (
                <tr key={idx}>
                  <td style={{ border: "1px solid black", padding: "5px" }}>{bid.bidder}</td>
                  <td style={{ border: "1px solid black", padding: "5px" }}>{bid.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Refund History */}
      <div style={{ marginTop: "30px" }}>
        <h2>💸 Refund History</h2>
        {refunds.length === 0 ? (
          <p>No refunds yet</p>
        ) : (
          <table style={{ margin: "0 auto", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ border: "1px solid black", padding: "5px" }}>Refunded To</th>
                <th style={{ border: "1px solid black", padding: "5px" }}>Amount (ETH)</th>
              </tr>
            </thead>
            <tbody>
              {refunds.map((r, idx) => (
                <tr key={idx}>
                  <td style={{ border: "1px solid black", padding: "5px" }}>{r.bidder}</td>
                  <td style={{ border: "1px solid black", padding: "5px" }}>{r.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
