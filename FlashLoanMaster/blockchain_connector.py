import os
import logging
from web3 import Web3
from decimal import Decimal
from datetime import datetime
import requests
from app import db
from models import NetworkConfig, Transaction
import json
import time
from security import get_security_manager


logger = logging.getLogger(__name__)

def get_gas_price(network_name):
    """Get current gas price for the network."""
    try:
        w3 = Web3(Web3.HTTPProvider(get_rpc_url(network_name)))
        if not w3.is_connected():
            return 0
        return w3.eth.gas_price
    except Exception as e:
        logger.error(f"Error getting gas price for {network_name}: {e}")
        return 0

def estimate_gas_cost(to_address, data, network_name):
    """Estimate gas cost for a transaction."""
    try:
        w3 = Web3(Web3.HTTPProvider(get_rpc_url(network_name)))
        if not w3.is_connected():
            return 0
            
        gas_estimate = w3.eth.estimate_gas({
            'to': to_address,
            'data': data
        })
        gas_price = w3.eth.gas_price
        
        return gas_estimate * gas_price
    except Exception as e:
        logger.error(f"Error estimating gas cost: {e}")
        return 0

def get_rpc_url(network_name):
    """Get RPC URL for network."""
    network_urls = {
        'ethereum': 'https://eth-mainnet.g.alchemy.com/v2/F3RL542h9YLkPcVPiYB0Ph2bl9QJQ9pO',
        'polygon': 'https://polygon-mainnet.g.alchemy.com/v2/F3RL542h9YLkPcVPiYB0Ph2bl9QJQ9pO',
        'optimism': 'https://opt-mainnet.g.alchemy.com/v2/F3RL542h9YLkPcVPiYB0Ph2bl9QJQ9pO',
        'arbitrum': 'https://arb-mainnet.g.alchemy.com/v2/F3RL542h9YLkPcVPiYB0Ph2bl9QJQ9pO'
    }
    return network_urls.get(network_name.lower())

class BlockchainConnector:
    def __init__(self):
        self.web3_connections = {}
        self.btc_profit_wallet = "bc1qxcfdzz3xhc4fkjwdtmdx94glxjx0zk2m53xmth"
        self.last_distribution_time = 0
        self.profit_distribution = {
            "gas_reserve": Decimal('0.10'),  # 10% for gas
            "operations": Decimal('0.20'),  # 20% for operations
            "btc_payout": Decimal('0.70')  # 70% to BTC wallet
        }

    def connect_network(self, network_name, rpc_url):
        try:
            w3 = Web3(Web3.HTTPProvider(rpc_url))
            if not w3.is_connected:
                raise Exception(f"Failed to connect to {network_name}")

            self.web3_connections[network_name] = w3
            logger.info(f"Connected to network {network_name}")
            return w3
        except Exception as e:
            logger.error(f"Error connecting to {network_name}: {str(e)}")
            return None

    def distribute_profits(self, total_profit: Decimal):
        """Distribute profits according to configured ratios."""
        try:
            # Calculate shares
            gas_share = total_profit * self.profit_distribution["gas_reserve"]
            ops_share = total_profit * self.profit_distribution["operations"]  
            btc_share = total_profit * self.profit_distribution["btc_payout"]

            logger.info(f"Distributing profits - BTC: {btc_share}, Gas: {gas_share}, Ops: {ops_share}")

            # Send BTC share
            current_time = datetime.now().timestamp()
            if current_time - self.last_distribution_time >= 1800:  # 30 minutes
                self.transfer_to_btc(btc_share)
                self.last_distribution_time = current_time

            return {
                "gas_share": gas_share,
                "ops_share": ops_share,
                "btc_share": btc_share
            }

        except Exception as e:
            logger.error(f"Error in profit distribution: {str(e)}")
            return None

    def transfer_to_btc(self, amount: Decimal):
        """Transfer profits to BTC wallet."""
        try:
            logger.info(f"Transferring {amount} BTC to {self.btc_profit_wallet}")
            # Here you would implement the actual BTC transfer logic using a library like bitcoinlib
            # This is a placeholder for the actual implementation.  Replace with your BTC transfer code
            return True
        except Exception as e:
            logger.error(f"Error in BTC transfer: {str(e)}")
            return False

    def get_token_balance(self, network_name, token_address, wallet_address):
        w3 = self.web3_connections.get(network_name)
        if not w3:
            return 0
        # ERC20 ABI (minimal for balanceOf)
        abi = [
            {
                "constant": True,
                "inputs": [{"name": "_owner", "type": "address"}],
                "name": "balanceOf",
                "outputs": [{"name": "balance", "type": "uint256"}],
                "type": "function"
            }
        ]
        
        # Create contract instance
        token_contract = w3.eth.contract(address=token_address, abi=abi)
        
        # Call balanceOf
        balance = token_contract.functions.balanceOf(wallet_address).call()
        
        return balance

    def get_eth_balance(self, network_name, wallet_address):
        w3 = self.web3_connections.get(network_name)
        if not w3:
            return 0
        # Get balance in wei
        balance_wei = w3.eth.get_balance(wallet_address)
        
        # Convert to ETH units
        balance_eth = w3.fromWei(balance_wei, 'ether')
        
        return balance_eth

    def get_gas_price(self, network_name):
        w3 = self.web3_connections.get(network_name)
        if not w3:
            return 0
        # Get gas price in wei
        gas_price_wei = w3.eth.gas_price
        
        # Convert to Gwei
        gas_price_gwei = w3.fromWei(gas_price_wei, 'gwei')
        
        return gas_price_gwei

    def estimate_gas_cost(self, network_name, to_address, data):
        w3 = self.web3_connections.get(network_name)
        if not w3:
            return 0
        # Estimate gas
        gas = w3.eth.estimate_gas({
            'to': to_address,
            'data': data
        })
        
        # Get gas price
        gas_price = w3.eth.gas_price
        
        # Calculate cost in wei
        cost_wei = gas * gas_price
        
        # Convert to ETH
        cost_eth = w3.fromWei(cost_wei, 'ether')
        
        return cost_eth

    def send_transaction(self, network_name, to_address, data, value=0, private_key=None):
        w3 = self.web3_connections.get(network_name)
        if not w3:
            return {'tx_hash': None, 'receipt': None, 'status': 'failed', 'error': f"No connection to {network_name}"}
        # Get security manager instance
        security_manager = get_security_manager()
        
        # Get private key from security manager if not provided
        if private_key is None:
            private_key = security_manager.get_private_key()
            
        if not private_key:
            logger.error("No private key available for sending transaction")
            return None
        
        # Get the account from private key
        account = w3.eth.account.from_key(private_key)
        sender_address = account.address
        
        # Get nonce
        nonce = w3.eth.get_transaction_count(sender_address)
        
        # Prepare transaction
        tx = {
            'to': to_address,
            'value': value,
            'gas': 2000000,  # Set a high gas limit, will be estimated
            'gasPrice': w3.eth.gas_price,
            'nonce': nonce,
            'data': data,
            'chainId': w3.eth.chain_id
        }
        
        # Estimate gas
        try:
            tx['gas'] = w3.eth.estimate_gas(tx)
        except Exception as e:
            logger.warning(f"Error estimating gas, using default: {e}")
        
        # Sign transaction using SecurityManager if using default key
        if private_key == security_manager.get_private_key():
            signed_tx = security_manager.sign_transaction(w3, tx)
        else:
            # Sign with provided key
            signed_tx = w3.eth.account.sign_transaction(tx, private_key)
        
        if not signed_tx:
            logger.error("Failed to sign transaction")
            return {
                'tx_hash': None,
                'receipt': None,
                'status': 'failed',
                'error': 'Failed to sign transaction'
            }
        
        # Send transaction
        tx_hash = w3.eth.send_raw_transaction(signed_tx.rawTransaction)
        
        logger.info(f"Transaction sent: {tx_hash.hex()}")
        
        # Wait for receipt
        receipt = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=120)
        
        logger.info(f"Transaction mined: {receipt}")
        
        return {
            'tx_hash': tx_hash.hex(),
            'receipt': receipt,
            'status': 'successful' if receipt.status == 1 else 'failed'
        }

    def swap_tokens(self, network_name, router_address, token_in, token_out, amount_in, min_amount_out, deadline, private_key=None):
        w3 = self.web3_connections.get(network_name)
        if not w3:
            return {'tx_hash': None, 'receipt': None, 'status': 'failed', 'error': f"No connection to {network_name}"}
        # Get private key from security manager if not provided
        if private_key is None:
            security_manager = get_security_manager()
            private_key = security_manager.get_private_key()
            
        if not private_key:
            logger.error("No private key available for swap transaction")
            return None
        
        # Get the account from private key
        account = w3.eth.account.from_key(private_key)
        sender_address = account.address
        
        # Router ABI (minimal for swapExactTokensForTokens)
        router_abi = [
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
            }
        ]
        
        # Create router contract instance
        router_contract = w3.eth.contract(address=router_address, abi=router_abi)
        
        # Build the swap function call
        swap_func = router_contract.functions.swapExactTokensForTokens(
            amount_in,
            min_amount_out,
            [token_in, token_out],
            sender_address,
            deadline
        )
        
        # Get transaction data
        swap_data = swap_func.build_transaction({
            'from': sender_address,
            'nonce': w3.eth.get_transaction_count(sender_address),
            'gas': 2000000,  # Will be estimated
            'gasPrice': w3.eth.gas_price,
            'chainId': w3.eth.chain_id
        })
        
        # Estimate gas
        try:
            swap_data['gas'] = w3.eth.estimate_gas(swap_data)
        except Exception as e:
            logger.warning(f"Error estimating gas, using default: {e}")
        
        # Sign transaction using SecurityManager if no explicit private key
        security_manager = get_security_manager()
        if private_key == security_manager.get_private_key():
            signed_tx = security_manager.sign_transaction(w3, swap_data)
        else:
            # Sign with provided key
            signed_tx = w3.eth.account.sign_transaction(swap_data, private_key)
        
        if not signed_tx:
            logger.error("Failed to sign swap transaction")
            return {
                'tx_hash': None,
                'receipt': None,
                'status': 'failed',
                'error': 'Failed to sign transaction'
            }
        
        # Send transaction
        tx_hash = w3.eth.send_raw_transaction(signed_tx.rawTransaction)
        
        logger.info(f"Swap transaction sent: {tx_hash.hex()}")
        
        # Wait for receipt
        receipt = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=120)
        
        logger.info(f"Swap transaction mined: {receipt}")
        
        return {
            'tx_hash': tx_hash.hex(),
            'receipt': receipt,
            'status': 'successful' if receipt.status == 1 else 'failed'
        }

def load_network_configurations():
    """Load all active network configurations from the database."""
    try:
        from app import app
        with app.app_context():
            networks = NetworkConfig.query.filter_by(active=True).all()
            return networks
    except Exception as e:
        logger.error(f"Error loading network configurations: {e}")
        return []

def check_network_connections(blockchain_connector):
    """Check all network connections and reconnect if needed."""
    try:
        networks = load_network_configurations()
        for network in networks:
            if network.network_name not in blockchain_connector.web3_connections or not blockchain_connector.web3_connections[network.network_name].isConnected():
                blockchain_connector.connect_network(network.network_name, network.rpc_url)
        logger.info("Network connection check completed")
    except Exception as e:
        logger.error(f"Error checking network connections: {e}")

#Example usage
blockchain_connector = BlockchainConnector()
check_network_connections(blockchain_connector)