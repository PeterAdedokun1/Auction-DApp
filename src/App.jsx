import { useState, useEffect } from "react"
import { ethers } from "ethers"
import { useAccount, useDisconnect, useWalletClient } from "wagmi"
import { useAppKit } from "@reown/appkit/react"
import auctionArtifact from "./auctionABI.json"

const auctionABI = auctionArtifact.output.abi
const CONTRACT_ADDRESS = "0xb1cF697a379F1304953e014CF76EF1Fcb63e1d98"

export default function AuctionDapp() {
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const { data: walletClient } = useWalletClient()
  const { open } = useAppKit()

  const [highestBid, setHighestBid] = useState(0)
  const [highestBidder, setHighestBidder] = useState(null)
  const [bidAmount, setBidAmount] = useState("")
  const [endTime, setEndTime] = useState(null)
  const [bids, setBids] = useState([]) // 🟢 bid history

  // 🟢 Place bid
  async function placeBid() {
    if (!bidAmount) return alert("⚠️ Enter a bid amount")
    if (!walletClient) return alert("⚠️ Connect a wallet first")

    try {
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const contract = new ethers.Contract(CONTRACT_ADDRESS, auctionABI, signer)

      const tx = await contract.bid({ value: ethers.parseEther(bidAmount) })
      await tx.wait()
      alert("✅ Bid placed successfully!")

      // Refresh data after bidding
      fetchAuctionData()
      fetchBidHistory()
    } catch (error) {
      alert(`❌ ${error.message}`)
    }
  }

  // 🟢 Fetch auction data
  async function fetchAuctionData() {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum)
      const contract = new ethers.Contract(CONTRACT_ADDRESS, auctionABI, provider)

      const hb = await contract.highestBid()
      const hbr = await contract.highestBidder()
      const et = await contract.endTime()

      setHighestBid(ethers.formatEther(hb))
      setHighestBidder(hbr)
      setEndTime(Number(et))
    } catch (err) {
      console.error("Failed to fetch auction data:", err)
    }
  }

  // 🟢 Fetch past bids from events
  async function fetchBidHistory() {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum)
      const contract = new ethers.Contract(CONTRACT_ADDRESS, auctionABI, provider)

      const filter = contract.filters.HighestBidIncreased()
      const logs = await contract.queryFilter(filter, 0, "latest")

      const parsedBids = logs.map((log) => {
        return {
          bidder: log.args[0],
          amount: ethers.formatEther(log.args[1])
        }
      }).reverse() // newest first

      setBids(parsedBids)
    } catch (err) {
      console.error("Failed to fetch bid history:", err)
    }
  }

  // 🟢 On component load
  useEffect(() => {
    fetchAuctionData()
    fetchBidHistory()
  }, [])

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Auction DApp</h1>

      {/* 🟢 Wallet connect button */}
      {!isConnected ? (
        <button onClick={() => open()}>Connect Wallet</button>
      ) : (
        <div>
          <p>Connected: {address}</p>
          <button onClick={disconnect}>Disconnect</button>
        </div>
      )}

      {/* 🟢 Auction Info */}
      <div>
        <h3>Highest Bid: {highestBid} ETH</h3>
        <h3>Highest Bidder: {highestBidder || "None yet"}</h3>
        <h3>📅 Auction End (Unix): {endTime ? endTime : "Loading..."}</h3>
      </div>

      {/* 🟢 Bid Form */}
      <input
        type="text"
        placeholder="Enter ETH amount"
        value={bidAmount}
        onChange={(e) => setBidAmount(e.target.value)}
      />
      <button onClick={placeBid} disabled={!isConnected}>
        Place Bid
      </button>

      {/* 🟢 Bid History */}
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
    </div>
  )
}
