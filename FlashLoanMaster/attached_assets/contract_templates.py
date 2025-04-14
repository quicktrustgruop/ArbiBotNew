"""
Contract templates for flash loans and arbitrage
"""

# Flash loan contract template for Aave V2
FLASH_LOAN_CONTRACT = {
    "name": "ArbitrageFlashLoan",
    "abi": '''
[
    {
        "inputs": [
            {"internalType": "address", "name": "_tokenA", "type": "address"},
            {"internalType": "address", "name": "_tokenB", "type": "address"},
            {"internalType": "address", "name": "_buyDex", "type": "address"},
            {"internalType": "address", "name": "_sellDex", "type": "address"},
            {"internalType": "uint256", "name": "_loanAmount", "type": "uint256"}
        ],
        "name": "executeArbitrage",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getProfit",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    }
]
''',
    "bytecode": "0x608060405234801561001057600080fd5b506101f0806100206000396000f3fe608060405260043...",  # Abbreviated for brevity
    "solidity_code": """
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "@aave/protocol-v2/contracts/flashloan/base/FlashLoanReceiverBase.sol";
import "@aave/protocol-v2/contracts/interfaces/ILendingPoolAddressesProvider.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";

contract ArbitrageFlashLoan is FlashLoanReceiverBase {
    address public owner;
    uint256 public profit;
    
    constructor(address _addressProvider) FlashLoanReceiverBase(ILendingPoolAddressesProvider(_addressProvider)) {
        owner = msg.sender;
    }
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    function executeArbitrage(
        address _tokenA,
        address _tokenB,
        address _buyDex,
        address _sellDex,
        uint256 _loanAmount
    ) external onlyOwner {
        // Request flash loan from Aave
        address[] memory assets = new address[](1);
        assets[0] = _tokenA;
        
        uint256[] memory amounts = new uint256[](1);
        amounts[0] = _loanAmount;
        
        // 0 = no debt, 1 = stable, 2 = variable
        uint256[] memory modes = new uint256[](1);
        modes[0] = 0;
        
        // Store arbitrage parameters for use in executeOperation
        bytes memory params = abi.encode(_tokenA, _tokenB, _buyDex, _sellDex);
        
        // Request the flash loan
        LENDING_POOL.flashLoan(
            address(this),
            assets,
            amounts,
            modes,
            address(this),
            params,
            0
        );
    }
    
    function executeOperation(
        address[] calldata assets,
        uint256[] calldata amounts,
        uint256[] calldata premiums,
        address initiator,
        bytes calldata params
    ) external override returns (bool) {
        // Ensure only the LendingPool can call this function
        require(msg.sender == address(LENDING_POOL), "Invalid caller");
        require(initiator == address(this), "Invalid initiator");
        
        // Decode the params
        (address tokenA, address tokenB, address buyDex, address sellDex) = abi.decode(
            params,
            (address, address, address, address)
        );
        
        uint256 loanAmount = amounts[0];
        uint256 fee = premiums[0];
        uint256 totalDebt = loanAmount + fee;
        
        // Approve tokens for DEX trading
        IERC20(tokenA).approve(buyDex, loanAmount);
        
        // Execute the arbitrage
        // 1. Buy tokenB with tokenA on buyDex
        address[] memory path1 = new address[](2);
        path1[0] = tokenA;
        path1[1] = tokenB;
        
        uint256[] memory amountsOut = IUniswapV2Router02(buyDex).getAmountsOut(loanAmount, path1);
        uint256 tokenBAmount = IUniswapV2Router02(buyDex).swapExactTokensForTokens(
            loanAmount,
            amountsOut[1],
            path1,
            address(this),
            block.timestamp
        )[1];
        
        // 2. Approve tokenB for selling on sellDex
        IERC20(tokenB).approve(sellDex, tokenBAmount);
        
        // 3. Sell tokenB for tokenA on sellDex
        address[] memory path2 = new address[](2);
        path2[0] = tokenB;
        path2[1] = tokenA;
        
        amountsOut = IUniswapV2Router02(sellDex).getAmountsOut(tokenBAmount, path2);
        uint256 tokenAAmount = IUniswapV2Router02(sellDex).swapExactTokensForTokens(
            tokenBAmount,
            amountsOut[1],
            path2,
            address(this),
            block.timestamp
        )[1];
        
        // 4. Calculate profit and repay loan
        require(tokenAAmount >= totalDebt, "Arbitrage not profitable");
        profit = tokenAAmount - totalDebt;
        
        // Approve the LendingPool to take back the loan plus fees
        IERC20(tokenA).approve(address(LENDING_POOL), totalDebt);
        
        return true;
    }
    
    function getProfit() external view returns (uint256) {
        return profit;
    }
    
    function withdrawProfit(address token) external onlyOwner {
        uint256 balance = IERC20(token).balanceOf(address(this));
        require(balance > 0, "No balance to withdraw");
        IERC20(token).transfer(owner, balance);
    }
}
"""
}

# Uniswap V2 Router interface (simplified)
UNISWAP_V2_ROUTER_ABI = '''
[
    {
        "inputs": [
            {"internalType": "uint256", "name": "amountIn", "type": "uint256"},
            {"internalType": "uint256", "name": "amountOutMin", "type": "uint256"},
            {"internalType": "address[]", "name": "path", "type": "address[]"},
            {"internalType": "address", "name": "to", "type": "address"},
            {"internalType": "uint256", "name": "deadline", "type": "uint256"}
        ],
        "name": "swapExactTokensForTokens",
        "outputs": [{"internalType": "uint256[]", "name": "amounts", "type": "uint256[]"}],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {"internalType": "uint256", "name": "amountIn", "type": "uint256"},
            {"internalType": "address[]", "name": "path", "type": "address[]"}
        ],
        "name": "getAmountsOut",
        "outputs": [{"internalType": "uint256[]", "name": "amounts", "type": "uint256[]"}],
        "stateMutability": "view",
        "type": "function"
    }
]
'''

# ERC20 token interface (simplified)
ERC20_ABI = '''
[
    {
        "constant": true,
        "inputs": [],
        "name": "name",
        "outputs": [{"name": "", "type": "string"}],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "symbol",
        "outputs": [{"name": "", "type": "string"}],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "decimals",
        "outputs": [{"name": "", "type": "uint8"}],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [{"name": "_owner", "type": "address"}],
        "name": "balanceOf",
        "outputs": [{"name": "balance", "type": "uint256"}],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            {"name": "_to", "type": "address"},
            {"name": "_value", "type": "uint256"}
        ],
        "name": "transfer",
        "outputs": [{"name": "", "type": "bool"}],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            {"name": "_spender", "type": "address"},
            {"name": "_value", "type": "uint256"}
        ],
        "name": "approve",
        "outputs": [{"name": "", "type": "bool"}],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [
            {"name": "_owner", "type": "address"},
            {"name": "_spender", "type": "address"}
        ],
        "name": "allowance",
        "outputs": [{"name": "", "type": "uint256"}],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    }
]
'''
