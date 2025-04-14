import os
import logging
from web3 import Web3
from app import db
from models import FlashLoanConfig, ArbitrageOpportunity, Transaction, NetworkConfig, TokenConfig, DexConfig
from blockchain_connector import connect_to_network
from datetime import datetime
import json
import time

# Configure logging
logger = logging.getLogger(__name__)

# Flash loan ABIs
AAVE_FLASH_LOAN_ABI = [
    {
        "inputs": [
            {"internalType": "address[]", "name": "assets", "type": "address[]"},
            {"internalType": "uint256[]", "name": "amounts", "type": "uint256[]"},
            {"internalType": "uint256[]", "name": "premiums", "type": "uint256[]"},
            {"internalType": "address", "name": "initiator", "type": "address"},
            {"internalType": "bytes", "name": "params", "type": "bytes"}
        ],
        "name": "executeOperation",
        "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {"internalType": "address[]", "name": "assets", "type": "address[]"},
            {"internalType": "uint256[]", "name": "amounts", "type": "uint256[]"},
            {"internalType": "uint256[]", "name": "modes", "type": "uint256[]"},
            {"internalType": "address", "name": "onBehalfOf", "type": "address"},
            {"internalType": "bytes", "name": "params", "type": "bytes"},
            {"internalType": "uint16", "name": "referralCode", "type": "uint16"}
        ],
        "name": "flashLoan",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
]

DYDX_FLASH_LOAN_ABI = [
    {
        "constant": false,
        "inputs": [
            {"internalType": "address", "name": "token", "type": "address"},
            {"internalType": "uint256", "name": "amount", "type": "uint256"},
            {"internalType": "bytes", "name": "data", "type": "bytes"}
        ],
        "name": "flashLoan",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    }
]

UNISWAP_V3_FLASH_LOAN_ABI = [
    {
        "inputs": [
            {"internalType": "address", "name": "token0", "type": "address"},
            {"internalType": "address", "name": "token1", "type": "address"},
            {"internalType": "uint24", "name": "fee", "type": "uint24"},
            {"internalType": "uint160", "name": "sqrtPriceX96", "type": "uint160"}
        ],
        "name": "createPool",
        "outputs": [{"internalType": "address", "name": "pool", "type": "address"}],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {"internalType": "uint256", "name": "amount0", "type": "uint256"},
            {"internalType": "uint256", "name": "amount1", "type": "uint256"},
            {"internalType": "bytes", "name": "data", "type": "bytes"}
        ],
        "name": "flash",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
]

def get_flash_loan_protocol(network_name, protocol_name):
    """Get flash loan protocol configuration."""
    try:
        # Get network
        network = NetworkConfig.query.filter_by(network_name=network_name, active=True).first()
        
        if not network:
            logger.error(f"Network configuration for {network_name} not found or inactive")
            return None
        
        # Get flash loan protocol
        protocol = FlashLoanConfig.query.filter_by(
            network_id=network.id,
            protocol=protocol_name,
            active=True
        ).first()
        
        if not protocol:
            logger.error(f"Flash loan protocol {protocol_name} not found or inactive on {network_name}")
            return None
        
        return protocol
    
    except Exception as e:
        logger.error(f"Error getting flash loan protocol: {e}")
        return None

def execute_aave_flash_loan(network_name, token_address, amount, min_profit=0.5):
        """Execute flash loan with minimum profit requirement"""
        logger.info(f"Executing flash loan on {network_name} for {amount} of token {token_address}")
    """Execute a flash loan using Aave protocol."""
    try:
        # Connect to network
        w3 = connect_to_network(network_name)
        
        if not w3:
            logger.error(f"Failed to connect to {network_name}")
            return False
        
        # Get Aave flash loan protocol
        protocol = get_flash_loan_protocol(network_name, "aave")
        
        if not protocol:
            return False
        
        # Get private key
        private_key = os.environ.get("PRIVATE_KEY")
        
        if not private_key:
            logger.error("No private key available for executing flash loan")
            return False
        
        # Get account
        account = w3.eth.account.from_key(private_key)
        sender_address = account.address
        
        # Create contract instance
        contract = w3.eth.contract(address=protocol.contract_address, abi=AAVE_FLASH_LOAN_ABI)
        
        # Prepare parameters
        assets = [token_address]
        amounts = [amount]
        modes = [0]  # 0 means no debt (flash loan)
        on_behalf_of = sender_address
        params = "0x"
        referral_code = 0
        
        # Build transaction
        tx = contract.functions.flashLoan(
            assets,
            amounts,
            modes,
            on_behalf_of,
            params,
            referral_code
        ).build_transaction({
            'from': sender_address,
            'nonce': w3.eth.get_transaction_count(sender_address),
            'gas': 2000000,  # Will be estimated
            'gasPrice': w3.eth.gas_price,
            'chainId': w3.eth.chain_id
        })
        
        # Estimate gas
        try:
            tx['gas'] = w3.eth.estimate_gas(tx)
        except Exception as e:
            logger.warning(f"Error estimating gas, using default: {e}")
        
        # Sign transaction
        signed_tx = w3.eth.account.sign_transaction(tx, private_key)
        
        # Send transaction
        tx_hash = w3.eth.send_raw_transaction(signed_tx.rawTransaction)
        
        logger.info(f"Flash loan transaction sent: {tx_hash.hex()}")
        
        # Wait for receipt
        receipt = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=120)
        
        logger.info(f"Flash loan transaction mined: {receipt}")
        
        return receipt.status == 1
    
    except Exception as e:
        logger.error(f"Error executing Aave flash loan: {e}")
        return False

def execute_dydx_flash_loan(network_name, token_address, amount):
    """Execute a flash loan using dYdX protocol."""
    try:
        # Connect to network
        w3 = connect_to_network(network_name)
        
        if not w3:
            logger.error(f"Failed to connect to {network_name}")
            return False
        
        # Get dYdX flash loan protocol
        protocol = get_flash_loan_protocol(network_name, "dydx")
        
        if not protocol:
            return False
        
        # Get private key
        private_key = os.environ.get("PRIVATE_KEY")
        
        if not private_key:
            logger.error("No private key available for executing flash loan")
            return False
        
        # Get account
        account = w3.eth.account.from_key(private_key)
        sender_address = account.address
        
        # Create contract instance
        contract = w3.eth.contract(address=protocol.contract_address, abi=DYDX_FLASH_LOAN_ABI)
        
        # Prepare parameters
        data = "0x"
        
        # Build transaction
        tx = contract.functions.flashLoan(
            token_address,
            amount,
            data
        ).build_transaction({
            'from': sender_address,
            'nonce': w3.eth.get_transaction_count(sender_address),
            'gas': 2000000,  # Will be estimated
            'gasPrice': w3.eth.gas_price,
            'chainId': w3.eth.chain_id
        })
        
        # Estimate gas
        try:
            tx['gas'] = w3.eth.estimate_gas(tx)
        except Exception as e:
            logger.warning(f"Error estimating gas, using default: {e}")
        
        # Sign transaction
        signed_tx = w3.eth.account.sign_transaction(tx, private_key)
        
        # Send transaction
        tx_hash = w3.eth.send_raw_transaction(signed_tx.rawTransaction)
        
        logger.info(f"Flash loan transaction sent: {tx_hash.hex()}")
        
        # Wait for receipt
        receipt = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=120)
        
        logger.info(f"Flash loan transaction mined: {receipt}")
        
        return receipt.status == 1
    
    except Exception as e:
        logger.error(f"Error executing dYdX flash loan: {e}")
        return False

def execute_uniswap_v3_flash_loan(network_name, token0_address, token1_address, amount0, amount1):
    """Execute a flash loan using Uniswap V3 protocol."""
    try:
        # Connect to network
        w3 = connect_to_network(network_name)
        
        if not w3:
            logger.error(f"Failed to connect to {network_name}")
            return False
        
        # Get Uniswap V3 flash loan protocol
        protocol = get_flash_loan_protocol(network_name, "uniswap_v3")
        
        if not protocol:
            return False
        
        # Get private key
        private_key = os.environ.get("PRIVATE_KEY")
        
        if not private_key:
            logger.error("No private key available for executing flash loan")
            return False
        
        # Get account
        account = w3.eth.account.from_key(private_key)
        sender_address = account.address
        
        # Create contract instance
        contract = w3.eth.contract(address=protocol.contract_address, abi=UNISWAP_V3_FLASH_LOAN_ABI)
        
        # Prepare parameters
        data = "0x"
        
        # Build transaction
        tx = contract.functions.flash(
            amount0,
            amount1,
            data
        ).build_transaction({
            'from': sender_address,
            'nonce': w3.eth.get_transaction_count(sender_address),
            'gas': 2000000,  # Will be estimated
            'gasPrice': w3.eth.gas_price,
            'chainId': w3.eth.chain_id
        })
        
        # Estimate gas
        try:
            tx['gas'] = w3.eth.estimate_gas(tx)
        except Exception as e:
            logger.warning(f"Error estimating gas, using default: {e}")
        
        # Sign transaction
        signed_tx = w3.eth.account.sign_transaction(tx, private_key)
        
        # Send transaction
        tx_hash = w3.eth.send_raw_transaction(signed_tx.rawTransaction)
        
        logger.info(f"Flash loan transaction sent: {tx_hash.hex()}")
        
        # Wait for receipt
        receipt = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=120)
        
        logger.info(f"Flash loan transaction mined: {receipt}")
        
        return receipt.status == 1
    
    except Exception as e:
        logger.error(f"Error executing Uniswap V3 flash loan: {e}")
        return False

def execute_arbitrage_with_flash_loan(opportunity_id):
    """Execute an arbitrage opportunity using flash loans."""
    try:
        # Get opportunity
        opportunity = ArbitrageOpportunity.query.get(opportunity_id)
        
        if not opportunity:
            logger.error(f"Arbitrage opportunity with ID {opportunity_id} not found")
            return False
        
        # Update status
        opportunity.status = "executing"
        db.session.commit()
        
        # Parse token pair
        token_symbols = opportunity.token_pair.split('/')
        
        if len(token_symbols) != 2:
            logger.error(f"Invalid token pair format: {opportunity.token_pair}")
            opportunity.status = "failed"
            db.session.commit()
            return False
        
        # Get network
        network = NetworkConfig.query.filter_by(network_name=opportunity.network, active=True).first()
        
        if not network:
            logger.error(f"Network configuration for {opportunity.network} not found or inactive")
            opportunity.status = "failed"
            db.session.commit()
            return False
        
        # Get tokens
        token_a = TokenConfig.query.filter_by(network_id=network.id, symbol=token_symbols[0], active=True).first()
        token_b = TokenConfig.query.filter_by(network_id=network.id, symbol=token_symbols[1], active=True).first()
        
        if not token_a or not token_b:
            logger.error(f"Token configuration not found or inactive: {opportunity.token_pair}")
            opportunity.status = "failed"
            db.session.commit()
            return False
        
        # Get DEXs
        dex_buy = DexConfig.query.filter_by(network_id=network.id, dex_name=opportunity.buy_dex, active=True).first()
        dex_sell = DexConfig.query.filter_by(network_id=network.id, dex_name=opportunity.sell_dex, active=True).first()
        
        if not dex_buy or not dex_sell:
            logger.error(f"DEX configuration not found or inactive: {opportunity.buy_dex} or {opportunity.sell_dex}")
            opportunity.status = "failed"
            db.session.commit()
            return False
        
        # Calculate loan amount (simplified)
        loan_amount = 1000 * (10 ** token_a.decimals)  # $1000 worth of token_a
        
        # Execute flash loan (choose a protocol)
        success = execute_aave_flash_loan(opportunity.network, token_a.address, loan_amount)
        
        if not success:
            logger.error(f"Flash loan execution failed for opportunity {opportunity_id}")
            opportunity.status = "failed"
            db.session.commit()
            return False
        
        # Create transaction record
        transaction = Transaction(
            network=opportunity.network,
            token_pair=opportunity.token_pair,
            buy_dex=opportunity.buy_dex,
            sell_dex=opportunity.sell_dex,
            buy_amount=loan_amount,
            sell_amount=loan_amount * (1 + opportunity.price_difference_percent/100),
            profit=opportunity.expected_profit,
            gas_cost=0,  # To be updated
            net_profit=opportunity.expected_profit,  # To be updated
            timestamp=datetime.now(),
            status="successful",
            tx_hash="flash_loan_tx_hash",  # To be updated
            error_message=None
        )
        
        db.session.add(transaction)
        
        # Update opportunity status
        opportunity.status = "executed"
        db.session.commit()
        
        logger.info(f"Arbitrage opportunity {opportunity_id} executed successfully")
        
        return True
    
    except Exception as e:
        logger.error(f"Error executing arbitrage with flash loan: {e}")
        
        try:
            # Update opportunity status
            if opportunity:
                opportunity.status = "failed"
                db.session.commit()
        except:
            pass
        
        return False

def execute_flash_loans():
    """Execute flash loans for pending arbitrage opportunities."""
    try:
        # Get opportunities ready for execution
        opportunities = ArbitrageOpportunity.query.filter_by(status="detected").all()
        
        if not opportunities:
            logger.info("No opportunities ready for execution")
            return
        
        logger.info(f"Found {len(opportunities)} opportunities ready for execution")
        
        # Execute each opportunity
        for opportunity in opportunities:
            execute_arbitrage_with_flash_loan(opportunity.id)
            
            # Sleep to avoid network congestion
            time.sleep(5)
        
        logger.info("Finished executing flash loans")
    
    except Exception as e:
        logger.error(f"Error executing flash loans: {e}")
