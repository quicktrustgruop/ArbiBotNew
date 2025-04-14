import logging
import time
import requests
import json
from app import db
from models import ArbitrageOpportunity, NetworkConfig, DexConfig, TokenConfig
from blockchain_connector import BlockchainConnector
from web3 import Web3
from datetime import datetime

# Configure logging
logger = logging.getLogger(__name__)

# ABIs for price checking
PAIR_ABI = [
    {
        "constant": True,
        "inputs": [],
        "name": "getReserves",
        "outputs": [
            {"internalType": "uint112", "name": "_reserve0", "type": "uint112"},
            {"internalType": "uint112", "name": "_reserve1", "type": "uint112"},
            {"internalType": "uint32", "name": "_blockTimestampLast", "type": "uint32"}
        ],
        "payable": False,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": True,
        "inputs": [],
        "name": "token0",
        "outputs": [{"internalType": "address", "name": "", "type": "address"}],
        "payable": False,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": True,
        "inputs": [],
        "name": "token1",
        "outputs": [{"internalType": "address", "name": "", "type": "address"}],
        "payable": False,
        "stateMutability": "view",
        "type": "function"
    }
]

FACTORY_ABI = [
    {
        "constant": True,
        "inputs": [
            {"internalType": "address", "name": "", "type": "address"},
            {"internalType": "address", "name": "", "type": "address"}
        ],
        "name": "getPair",
        "outputs": [{"internalType": "address", "name": "", "type": "address"}],
        "payable": False,
        "stateMutability": "view",
        "type": "function"
    }
]

def get_token_price(w3, dex_config, token_a, token_b):
    """Get the price of token_a in terms of token_b on a specific DEX."""
    try:
        # Create factory contract instance
        factory_contract = w3.eth.contract(address=dex_config.factory_address, abi=FACTORY_ABI)

        # Get pair address
        pair_address = factory_contract.functions.getPair(token_a.address, token_b.address).call()

        if pair_address == '0x0000000000000000000000000000000000000000':
            logger.warning(f"No liquidity pair found for {token_a.symbol}/{token_b.symbol} on {dex_config.dex_name}")
            return 0

        # Create pair contract instance
        pair_contract = w3.eth.contract(address=pair_address, abi=PAIR_ABI)

        # Get reserves
        reserves = pair_contract.functions.getReserves().call()

        # Get token order in the pair
        token0_address = pair_contract.functions.token0().call()

        # Determine which reserve corresponds to which token
        if token0_address.lower() == token_a.address.lower():
            reserve_a, reserve_b = reserves[0], reserves[1]
        else:
            reserve_a, reserve_b = reserves[1], reserves[0]

        # Account for decimal differences
        decimal_factor = 10 ** (token_b.decimals - token_a.decimals)

        # Calculate price
        if reserve_a == 0:
            return 0

        price = (reserve_b / reserve_a) * decimal_factor

        return price

    except Exception as e:
        logger.error(f"Error getting token price on {dex_config.dex_name}: {e}")
        return 0

def find_arbitrage_opportunities(network_name):
    """Find arbitrage opportunities on a specific network."""
    try:
        # Get network configuration
        from models import NetworkConfig
        network = NetworkConfig.query.filter_by(name=network_name, active=True).first()
        if not network:
            logger.error(f"Network configuration for {network_name} not found or inactive")
            return []

        # Connect to the network
        blockchain_connector = BlockchainConnector()
        w3 = blockchain_connector.connect_network(network_name, network.rpc_url)

        if not w3:
            logger.error(f"Failed to connect to {network_name}")
            return []

        logger.info(f"Scanning network: {network_name}")

        # Get network configuration
        network = NetworkConfig.query.filter_by(name=network_name, active=True).first()

        if not network:
            logger.error(f"Network configuration for {network_name} not found or inactive")
            return []

        # Get all active DEXs on this network
        dexes = DexConfig.query.filter_by(network_id=network.id, active=True).all()

        if not dexes:
            logger.warning(f"No active DEXs configured for {network_name}")
            return []

        # Get all active tokens on this network
        tokens = TokenConfig.query.filter_by(network_id=network.id, active=True).all()

        if not tokens:
            logger.warning(f"No active tokens configured for {network_name}")
            return []

        # Find arbitrage opportunities
        opportunities = []

        # For each pair of tokens
        for i in range(len(tokens)):
            for j in range(i+1, len(tokens)):
                token_a = tokens[i]
                token_b = tokens[j]

                # Skip if same token
                if token_a.address.lower() == token_b.address.lower():
                    continue

                # For each pair of DEXs
                for dex1_index in range(len(dexes)):
                    for dex2_index in range(dex1_index+1, len(dexes)):
                        dex1 = dexes[dex1_index]
                        dex2 = dexes[dex2_index]

                        # Get prices on both DEXs
                        price1 = get_token_price(w3, dex1, token_a, token_b)
                        price2 = get_token_price(w3, dex2, token_a, token_b)

                        # Skip if either price is 0 (no liquidity)
                        if price1 == 0 or price2 == 0:
                            continue

                        # Calculate price difference
                        if price1 > price2:
                            price_diff = ((price1 / price2) - 1) * 100
                            buy_dex = dex2.dex_name
                            sell_dex = dex1.dex_name
                        else:
                            price_diff = ((price2 / price1) - 1) * 100
                            buy_dex = dex1.dex_name
                            sell_dex = dex2.dex_name

                        # If price difference is significant
                        if price_diff >= 1.0:  # At least 1% difference
                            # Calculate expected profit (simplified)
                            expected_profit = 1000 * (price_diff / 100)  # Assuming $1000 trade size

                            # Create opportunity
                            opportunity = ArbitrageOpportunity(
                                network=network_name,
                                token_pair=f"{token_a.symbol}/{token_b.symbol}",
                                buy_dex=buy_dex,
                                sell_dex=sell_dex,
                                price_difference_percent=price_diff,
                                expected_profit=expected_profit,
                                timestamp=datetime.now(),
                                status="detected"
                            )

                            opportunities.append(opportunity)

                            logger.info(f"Found arbitrage opportunity: {token_a.symbol}/{token_b.symbol} - " +
                                       f"Buy on {buy_dex}, sell on {sell_dex} - " +
                                       f"Price diff: {price_diff:.2f}% - " +
                                       f"Expected profit: ${expected_profit:.2f}")

        return opportunities

    except Exception as e:
        logger.error(f"Error finding arbitrage opportunities on {network_name}: {e}")
        return []

def iniciar_escaneamento():
    """Start scanning for arbitrage opportunities on all active networks."""
    try:
        from app import app

        # Use application context to fix the "Working outside of application context" error
        with app.app_context():
            # Get all active networks
            networks = NetworkConfig.query.filter_by(active=True).all()

            if not networks:
                logger.warning("No active networks configured")
                return []

            all_opportunities = []

            # Scan each network
            for network in networks:
                network_opportunities = find_arbitrage_opportunities(network.network_name)
                all_opportunities.extend(network_opportunities)

            # Save opportunities to database
            if all_opportunities:
                try:
                    db.session.add_all(all_opportunities)
                    db.session.commit()
                    logger.info(f"Found {len(all_opportunities)} arbitrage opportunities")
                except Exception as e:
                    logger.error(f"Error saving opportunities to database: {e}")
                    db.session.rollback()

            return all_opportunities

    except Exception as e:
        logger.error(f"Error scanning for arbitrage opportunities: {e}")
        return []

def process_stored_opportunities():
    """Process stored arbitrage opportunities."""
    try:
        # Get pending opportunities
        opportunities = ArbitrageOpportunity.query.filter_by(status="detected").all()

        if not opportunities:
            logger.info("No pending opportunities to process")
            return

        logger.info(f"Processing {len(opportunities)} pending opportunities")

        # Process each opportunity
        for opportunity in opportunities:
            # Update status to processing
            opportunity.status = "processing"
            db.session.commit()

            # TODO: Execute trades based on the opportunity
            # This would involve flash loans, swaps, etc.

            # For now, just mark as processed
            opportunity.status = "processed"

        # Commit changes
        db.session.commit()
        logger.info("Processed all pending opportunities")

    except Exception as e:
        logger.error(f"Error processing opportunities: {e}")
        db.session.rollback()

def monitor_prices():
    """Continuously monitor prices for arbitrage opportunities."""
    try:
        while True:
            logger.info("Starting price monitoring cycle")

            # Scan for opportunities
            opportunities = iniciar_escaneamento()

            # Process opportunities
            process_stored_opportunities()

            # Sleep before next cycle
            time.sleep(60)  # Sleep for 1 minute

    except KeyboardInterrupt:
        logger.info("Price monitoring stopped by user")
    except Exception as e:
        logger.error(f"Error in price monitoring: {e}")