// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

contract Auction {
    address public highestBidder;
    uint256 public highestBid;
    address public owner;

    event HighestBidIncreased(address bidder, uint256 amount);
    event BidRefunded(address bidder, uint256 amount);

    constructor() {
        owner = msg.sender;
    }

    function bid() external payable {
        require(msg.value > highestBid, "Bid not high enough!");

        // Refund previous highest bidder (if exists)
        if (highestBid > 0) {
            payable(highestBidder).transfer(highestBid);
            emit BidRefunded(highestBidder, highestBid);
        }

        // Update to new highest
        highestBidder = msg.sender;
        highestBid = msg.value;

        emit HighestBidIncreased(msg.sender, msg.value);
    }
}
