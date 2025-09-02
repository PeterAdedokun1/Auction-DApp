import { useState, useEffect } from "react";
import { ethers } from "ethers";
import auctionArtifact from "./auctionABI.json";

const auctionABI = auctionArtifact.output.abi;

// const CONTRACT_ADDRESS = "YOUR_SEPOLIA_CONTRACT_ADDRESS"; // replace with your deployed contract
const CONTRACT_ADDRESS = "0xb1cF697a379F1304953e014CF76EF1Fcb63e1d98";

export default function AuctionDapp() {
  const [account, setAccount] = useState(null);
  const [highestBid, setHighestBid] = useState(0);
  const [highestBidder, setHighestBidder] = useState(null);
  const [bidAmount, setBidAmount] = useState("");
  const [endTime, setEndTime] = useState(null);
  const [timeLeft, setTimeLeft] = useState("");
  // Connect Wallet
  async function connectWallet() {
    if (!window.ethereum) return alert("MetaMask not found!");

    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    setAccount(accounts[0]);
  }

  // Place a bid
  async function placeBid() {
    if (!bidAmount) return alert("⚠️ Please enter a bid amount");

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        auctionABI,
        signer
      );

      const tx = await contract.bid({ value: ethers.parseEther(bidAmount) });
      await tx.wait();

      alert("✅ Bid placed successfully!");
    } catch (error) {
      // ethers v6 error handling
      if (error.code === "INSUFFICIENT_FUNDS") {
        alert("❌ You don’t have enough ETH to place this bid");
      } else if (error.code === "ACTION_REJECTED") {
        alert("❌ You rejected the transaction in MetaMask");
      } else if (error.reason) {
        alert(`❌ Smart Contract Error: ${error.reason}`);
      } else {
        alert(`❌ Unexpected Error: ${error.message}`);
      }
    }
  }

  //  // Fetch auction details

  useEffect(() => {
    const fetchAuctionData = async () => {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        auctionABI,
        provider
      );
      const hb = await contract.highestBid();
      const hbr = await contract.highestBidder();
      const et = await contract.endTime();

      setHighestBid(ethers.formatEther(hb));
      setHighestBidder(hbr);
      setEndTime(Number(et));
    };
    fetchAuctionData();
  }, []);
  // Countdown timer
  useEffect(() => {
    if (!endTime) return;

    const interval = setInterval(() => {
      const now = Math.floor(Date.now() / 1000);
      const diff = endTime - now;
      if (diff <= 0) {
        setTimeLeft("Auction ended");
        clearInterval(interval);
      } else {
        const minutes = Math.floor(diff / 60);
        const seconds = diff % 60;
        setTimeLeft(`${minutes}m ${seconds}s`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [endTime]);
  // Listen for HighestBidIncreased event (with cleanup)
  useEffect(() => {
    let contract; // store reference so we can remove later

    const listenEvents = async () => {
      const provider = new ethers.BrowserProvider(window.ethereum);
      contract = new ethers.Contract(CONTRACT_ADDRESS, auctionABI, provider);

      const handler = (bidder, amount) => {
        setHighestBid(ethers.formatEther(amount));
        setHighestBidder(bidder);
      };

      // attach event listener
      contract.on("HighestBidIncreased", handler);
    };

    listenEvents();

    // cleanup function
    return () => {
      if (contract) {
        contract.removeAllListeners("HighestBidIncreased");
      }
    };
  }, []);

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Auction DApp</h1>

      {!account ? (
        <button onClick={connectWallet}>Connect Wallet</button>
      ) : (
        <p>Connected: {account}</p>
      )}

      <div>
        <h3>Highest Bid: {highestBid} ETH</h3>
        <h3>Highest Bidder: {highestBidder || "None yet"}</h3>
        <h3>⏰ Time Left: {timeLeft}</h3>
      </div>

      <input
        type="text"
        placeholder="Enter ETH amount"
        value={bidAmount}
        onChange={(e) => setBidAmount(e.target.value)}
      />
      <button onClick={placeBid}>Place Bid</button>
    </div>
  );
}
