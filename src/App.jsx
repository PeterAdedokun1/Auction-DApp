import { useState, useEffect } from "react";
import { ethers } from "ethers";
import auctionArtifact from "./auctionABI.json";

const auctionABI = auctionArtifact.output.abi;

// const CONTRACT_ADDRESS = "YOUR_SEPOLIA_CONTRACT_ADDRESS"; // replace with your deployed contract
const CONTRACT_ADDRESS = "";
export default function AuctionDapp() {
  const [account, setAccount] = useState(null);
  const [highestBid, setHighestBid] = useState(0);
  const [highestBidder, setHighestBidder] = useState(null);
  const [bidAmount, setBidAmount] = useState("");

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
    if (!bidAmount) return alert("Enter bid amount");

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(CONTRACT_ADDRESS, auctionABI, signer);

    const tx = await contract.bid({ value: ethers.parseEther(bidAmount) });
    await tx.wait();
    alert("Bid placed!");
  }

  // Listen for HighestBidIncreased event
  useEffect(() => {
    const listenEvents = async () => {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        auctionABI,
        provider
      );

      contract.on("HighestBidIncreased", (bidder, amount) => {
        setHighestBid(ethers.formatEther(amount));
        setHighestBidder(bidder);
      });
    };

    listenEvents();
  }, []);

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
    <div
      // className="p-4 "
      // style={{ marginLeft: "auto",marginRight: "auto", width: "100%",}}
    >
      <h1>Auction DApp</h1>

      {!account ? (
        <button onClick={connectWallet}>Connect Wallet</button>
      ) : (
        <p>Connected: {account}</p>
      )}

      <div>
        <h3>Highest Bid: {highestBid} ETH</h3>
        <h3>Highest Bidder: {highestBidder || "None yet"}</h3>
      </div>

      <input
        type="text"
        placeholder="Enter ETH amount"
        value={bidAmount}
        onChange={(e) => setBidAmount(e.target.value)}
      />
      <button onClick={placeBid}>Place Bid</button>
    </div>
    </div>
  );
}
