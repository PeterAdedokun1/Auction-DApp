//     // SPDX-License-Identifier: MIT
// pragma solidity ^0.8.22;

// import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

// contract TokenSwap {
//     IERC20 public tokenA;
//     IERC20 public tokenB;

//     uint256 public reserveA;
//     uint256 public reserveB;

//     address public owner;

//     constructor(address _tokenA, address _tokenB) {
//         tokenA = IERC20(_tokenA);
//         tokenB = IERC20(_tokenB);
//         owner = msg.sender;
//     }

//     modifier onlyOwner() {
//         require(msg.sender == owner, "Not owner");
//         _;
//     }

//     function addLiquidity(uint256 amountA, uint256 amountB) external onlyOwner {
//         tokenA.transferFrom(msg.sender, address(this), amountA);
//         tokenB.transferFrom(msg.sender, address(this), amountB);

//         reserveA += amountA;
//         reserveB += amountB;
//     }

//     function getPriceAtoB(uint256 amountA) public view returns (uint256) {
//         require(amountA > 0, "Amount must be > 0");
//         uint256 amountOut = (amountA * reserveB) / (reserveA + amountA);
//         return amountOut;
//     }

//     function swapAforB(uint256 amountA) external {
//         uint256 amountB = getPriceAtoB(amountA);

//         tokenA.transferFrom(msg.sender, address(this), amountA);
//         tokenB.transfer(msg.sender, amountB);

//         reserveA += amountA;
//         reserveB -= amountB;
//     }

//     function getPriceBtoA(uint256 amountB) public view returns (uint256) {
//         require(amountB > 0, "Amount must be > 0");
//         uint256 amountOut = (amountB * reserveA) / (reserveB + amountB);
//         return amountOut;
//     }

//     function swapBforA(uint256 amountB) external {
//         uint256 amountA = getPriceBtoA(amountB);

//         tokenB.transferFrom(msg.sender, address(this), amountB);
//         tokenA.transfer(msg.sender, amountA);

//         reserveB += amountB;
//         reserveA -= amountA;
//     }
// }
