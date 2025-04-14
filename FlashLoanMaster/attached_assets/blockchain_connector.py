import logging
import os
from web3 import Web3, HTTPProvider
from eth_account import Account
from typing import Dict, Optional, Any

logger = logging.getLogger(__name__)

class BlockchainConnector:
    """
    Class for handling connections to various blockchain networks
    """
    
    def __init__(self):
        self.web3_connections = {}
        self.setup_account()
        
    def setup_account(self):
        """
        Set up the account for transactions
        """
        private_key = os.environ.get("PRIVATE_KEY")
        
        if not private_key:
            logger.error("PRIVATE_KEY não configurada. Por favor, configure no Secrets do Replit")
            raise ValueError(
                "PRIVATE_KEY não encontrada no ambiente.\n"
                "1. Acesse Tools > Secrets no Replit\n"
                "2. Clique em '+New Secret'\n" 
                "3. Configure Key='PRIVATE_KEY' e Value='sua_chave_privada_aqui'"
            )
            
        try:
            self.account = Account.from_key(private_key)
            logger.info(f"Account set up successfully")
        except Exception as e:
            logger.error(f"Error setting up account: {str(e)}")
            raise
            
    def get_account(self):
        """
        Get the account for transactions
        
        Returns:
            Account object
        """
        return self.account
            
    def connect_to_network(self, network_id: str) -> Optional[Web3]:
        """
        Connect to a blockchain network
        
        Args:
            network_id: ID of the network to connect to
            
        Returns:
            Web3 instance if connection successful, None otherwise
        """
        # Check if we already have a connection
        if network_id in self.web3_connections:
            return self.web3_connections[network_id]
        
        # Get RPC URL
        rpc_url = self.get_rpc_url(network_id)
        if not rpc_url:
            logger.error(f"No RPC URL found for network {network_id}")
            return None
        
        try:
            # Create Web3 instance
            web3 = Web3(HTTPProvider(rpc_url))
            
            # Check connection
            if not web3.is_connected():
                logger.error(f"Failed to connect to network {network_id}")
                return None
            
            logger.info(f"Connected to network {network_id}")
            
            # Cache the connection
            self.web3_connections[network_id] = web3
            
            return web3
            
        except Exception as e:
            logger.error(f"Error connecting to network {network_id}: {str(e)}")
            return None
    
    def get_rpc_url(self, network_id: str) -> Optional[str]:
        """
        Get RPC URL for a network using Alchemy
        
        Args:
            network_id: ID of the network
            
        Returns:
            RPC URL if available, None otherwise
        """
        # First check environment variables
        env_var_name = f"{network_id.upper()}_RPC_URL"
        rpc_url = os.environ.get(env_var_name)
        
        if rpc_url:
            return rpc_url
            
        # Use Alchemy API key
        alchemy_key = os.environ.get("ALCHEMY_API_KEY")
        if not alchemy_key:
            logger.error("Alchemy API key not found in environment variables")
            return None
            
        # Primeiro tenta usar URLs específicas
        rpc_url = os.environ.get(f"{network_id.upper()}_RPC_URL")
        if rpc_url:
            return rpc_url
            
        # Fallback para Alchemy
        if network_id in ["ethereum", "polygon", "arbitrum", "optimism", "base", "avalanche", "solana", "linea", "mantle", "blast", "shape", "worldchain"]:
            return f"https://{network_id}-mainnet.g.alchemy.com/v2/{alchemy_key}"
        elif network_id == "bsc":
            return "https://bsc-dataseed.binance.org/"
        else:
            logger.error(f"No default RPC URL for network {network_id}")
            return None
            
    def get_token_balance(self, token_address: str, wallet_address: str, network_id: str) -> float:
        """
        Get token balance for a wallet
        
        Args:
            token_address: Address of the token
            wallet_address: Address of the wallet
            network_id: ID of the network
            
        Returns:
            Token balance as a float
        """
        web3 = self.connect_to_network(network_id)
        if not web3:
            return 0
        
        try:
            # Check if it's the native token (ETH, BNB, etc.)
            if token_address.lower() == "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee":
                balance_wei = web3.eth.get_balance(wallet_address)
                return web3.from_wei(balance_wei, 'ether')
            
            # For other tokens, we need the ERC20 ABI
            erc20_abi = [
                {
                    "constant": True,
                    "inputs": [{"name": "_owner", "type": "address"}],
                    "name": "balanceOf",
                    "outputs": [{"name": "balance", "type": "uint256"}],
                    "type": "function"
                },
                {
                    "constant": True,
                    "inputs": [],
                    "name": "decimals",
                    "outputs": [{"name": "", "type": "uint8"}],
                    "type": "function"
                }
            ]
            
            # Create contract instance
            token_contract = web3.eth.contract(address=token_address, abi=erc20_abi)
            
            # Get balance and decimals
            balance = token_contract.functions.balanceOf(wallet_address).call()
            decimals = token_contract.functions.decimals().call()
            
            # Convert to float
            return balance / (10 ** decimals)
            
        except Exception as e:
            logger.error(f"Error getting token balance: {str(e)}")
            return 0
    
    def get_token_price(self, token_address: str, network_id: str) -> float:
        """
        Get token price in USD
        
        Args:
            token_address: Address of the token
            network_id: ID of the network
            
        Returns:
            Token price in USD
        """
        # In a real implementation, we would query a price oracle or API
        # For this example, we'll return dummy values
        
        # Convert to lowercase for case-insensitive comparison
        token_address = token_address.lower()
        
        if token_address == "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee":
            # Native token
            if network_id == "ethereum":
                return 3500.0  # ETH price
            elif network_id == "bsc":
                return 300.0  # BNB price
            elif network_id == "polygon":
                return 1.0  # MATIC price
            else:
                return 1000.0  # Default
        elif token_address == "0xdac17f958d2ee523a2206206994597c13d831ec7":
            return 1.0  # USDT
        elif token_address == "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48":
            return 1.0  # USDC
        elif token_address == "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599":
            return 60000.0  # WBTC
        else:
            return 10.0  # Default price for other tokens
