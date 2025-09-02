// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

contract Auction {
    address public highestBidder;
    uint256 public highestBid;
    uint256 public endTime;
    address public owner;

    event HighestBidIncreased(address bidder, uint256 amount);

    constructor(uint _biddingTime){
        owner = msg.sender;
        endTime = block.timestamp + _biddingTime;
    }

    function bid() external payable {
        require(block.timestamp < endTime, "Auction ended already");

        require(msg.value > highestBid, "Bid not high enough!");

        highestBidder = msg.sender;
        highestBid = msg.value;

        emit HighestBidIncreased(msg.sender, msg.value);
    }
}
