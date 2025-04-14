import json
import os
import logging
import time
from datetime import datetime, timedelta
from app import db
from models import ArbitrageOpportunity, Transaction, BotStatus, CloudMiningStatus

# Configure logging
logger = logging.getLogger(__name__)

def load_json_file(file_path):
    """Load JSON data from a file."""
    try:
        with open(file_path, 'r') as file:
            data = json.load(file)
        return data
    except Exception as e:
        logger.error(f"Error loading JSON file {file_path}: {e}")
        return None

def save_json_file(file_path, data):
    """Save JSON data to a file."""
    try:
        with open(file_path, 'w') as file:
            json.dump(data, file, indent=4)
        return True
    except Exception as e:
        logger.error(f"Error saving JSON file {file_path}: {e}")
        return False

def format_currency(amount, decimals=2, symbol='$'):
    """Format a currency amount."""
    try:
        return f"{symbol}{amount:.{decimals}f}"
    except Exception as e:
        logger.error(f"Error formatting currency: {e}")
        return f"{symbol}0.00"

def format_percentage(percentage, decimals=2):
    """Format a percentage value."""
    try:
        return f"{percentage:.{decimals}f}%"
    except Exception as e:
        logger.error(f"Error formatting percentage: {e}")
        return "0.00%"

def calculate_profit_statistics():
    """Calculate profit statistics from transactions."""
    try:
        # Get all successful transactions
        transactions = Transaction.query.filter_by(status="successful").all()
        
        if not transactions:
            return {
                'total_profit': 0,
                'average_profit': 0,
                'total_transactions': 0,
                'success_rate': 0,
                'profit_by_network': {},
                'profit_by_token_pair': {},
                'profit_by_day': {},
                'largest_profit': 0,
                'total_gas_cost': 0
            }
        
        # Calculate statistics
        total_profit = sum(tx.net_profit for tx in transactions)
        average_profit = total_profit / len(transactions)
        total_transactions = len(transactions)
        
        # Calculate success rate
        all_transactions = Transaction.query.count()
        success_rate = (total_transactions / all_transactions) * 100 if all_transactions > 0 else 0
        
        # Calculate profit by network
        profit_by_network = {}
        for tx in transactions:
            if tx.network not in profit_by_network:
                profit_by_network[tx.network] = 0
            profit_by_network[tx.network] += tx.net_profit
        
        # Calculate profit by token pair
        profit_by_token_pair = {}
        for tx in transactions:
            if tx.token_pair not in profit_by_token_pair:
                profit_by_token_pair[tx.token_pair] = 0
            profit_by_token_pair[tx.token_pair] += tx.net_profit
        
        # Calculate profit by day
        profit_by_day = {}
        for tx in transactions:
            day = tx.timestamp.strftime('%Y-%m-%d')
            if day not in profit_by_day:
                profit_by_day[day] = 0
            profit_by_day[day] += tx.net_profit
        
        # Find largest profit
        largest_profit = max(tx.net_profit for tx in transactions) if transactions else 0
        
        # Calculate total gas cost
        total_gas_cost = sum(tx.gas_cost for tx in transactions)
        
        return {
            'total_profit': total_profit,
            'average_profit': average_profit,
            'total_transactions': total_transactions,
            'success_rate': success_rate,
            'profit_by_network': profit_by_network,
            'profit_by_token_pair': profit_by_token_pair,
            'profit_by_day': profit_by_day,
            'largest_profit': largest_profit,
            'total_gas_cost': total_gas_cost
        }
    
    except Exception as e:
        logger.error(f"Error calculating profit statistics: {e}")
        return {
            'total_profit': 0,
            'average_profit': 0,
            'total_transactions': 0,
            'success_rate': 0,
            'profit_by_network': {},
            'profit_by_token_pair': {},
            'profit_by_day': {},
            'largest_profit': 0,
            'total_gas_cost': 0
        }

def generate_mining_stats():
    """Generate simulated cloud mining statistics."""
    try:
        # Get the latest status
        latest_status = CloudMiningStatus.query.order_by(CloudMiningStatus.timestamp.desc()).first()
        
        # If no status exists, create a new one with default values
        if not latest_status:
            new_status = CloudMiningStatus(
                active=True,
                total_hash_power=0,
                active_workers=0,
                mining_revenue_24h=0,
                efficiency=0,
                total_profit=0,
                timestamp=datetime.now()
            )
            db.session.add(new_status)
            db.session.commit()
            return new_status
        
        # Get successful transactions in the last 24 hours
        yesterday = datetime.now() - timedelta(days=1)
        transactions = Transaction.query.filter(
            Transaction.status == "successful",
            Transaction.timestamp >= yesterday
        ).all()
        
        # Calculate revenue from transactions
        revenue_24h = sum(tx.net_profit for tx in transactions)
        
        # Update hash power based on activity
        total_hash_power = latest_status.total_hash_power
        if len(transactions) > 0:
            # Increase hash power
            total_hash_power = min(100, total_hash_power + 1)
        else:
            # Decrease hash power
            total_hash_power = max(0, total_hash_power - 0.5)
        
        # Calculate active workers based on hash power
        active_workers = int(total_hash_power / 10) + 1
        
        # Calculate efficiency
        efficiency = min(100, (revenue_24h / max(1, total_hash_power)) * 10)
        
        # Calculate total profit
        total_profit = latest_status.total_profit + revenue_24h
        
        # Create new status
        new_status = CloudMiningStatus(
            active=True,
            total_hash_power=total_hash_power,
            active_workers=active_workers,
            mining_revenue_24h=revenue_24h,
            efficiency=efficiency,
            total_profit=total_profit,
            timestamp=datetime.now()
        )
        
        db.session.add(new_status)
        db.session.commit()
        
        logger.info(f"Generated new mining stats: {new_status.to_dict()}")
        
        return new_status
    
    except Exception as e:
        logger.error(f"Error generating mining stats: {e}")
        return None

def update_bot_status():
    """Update the bot status with current statistics."""
    try:
        # Get the latest status
        latest_status = BotStatus.query.order_by(BotStatus.timestamp.desc()).first()
        
        # If no status exists, create a new one with default values
        if not latest_status:
            new_status = BotStatus(
                active=False,
                scan_count=0,
                successful_trades=0,
                failed_trades=0,
                timestamp=datetime.now(),
                last_scan=None
            )
            db.session.add(new_status)
            db.session.commit()
            return new_status
        
        # Get transaction statistics
        successful_trades = Transaction.query.filter_by(status="successful").count()
        failed_trades = Transaction.query.filter_by(status="failed").count()
        
        # Get opportunity statistics
        scan_count = ArbitrageOpportunity.query.count()
        
        # Create new status
        new_status = BotStatus(
            active=latest_status.active,
            scan_count=scan_count,
            successful_trades=successful_trades,
            failed_trades=failed_trades,
            timestamp=datetime.now(),
            last_scan=datetime.now()
        )
        
        db.session.add(new_status)
        db.session.commit()
        
        logger.info(f"Updated bot status: {new_status.to_dict()}")
        
        return new_status
    
    except Exception as e:
        logger.error(f"Error updating bot status: {e}")
        return None

def backup_database():
    """Backup the database to a JSON file."""
    try:
        # Get all data
        opportunities = ArbitrageOpportunity.query.all()
        transactions = Transaction.query.all()
        bot_status = BotStatus.query.all()
        mining_status = CloudMiningStatus.query.all()
        
        # Convert to dictionaries
        data = {
            'opportunities': [opp.to_dict() for opp in opportunities],
            'transactions': [tx.to_dict() for tx in transactions],
            'bot_status': [status.to_dict() for status in bot_status],
            'mining_status': [status.to_dict() for status in mining_status]
        }
        
        # Save to file
        backup_file = f"backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        save_json_file(backup_file, data)
        
        logger.info(f"Database backed up to {backup_file}")
        
        return backup_file
    
    except Exception as e:
        logger.error(f"Error backing up database: {e}")
        return None

def scheduled_tasks():
    """Run scheduled maintenance tasks."""
    try:
        logger.info("Running scheduled maintenance tasks")
        
        # Update bot status
        update_bot_status()
        
        # Generate mining stats
        generate_mining_stats()
        
        # Backup database (once per day)
        if datetime.now().hour == 0 and datetime.now().minute < 5:
            backup_database()
        
        logger.info("Scheduled maintenance tasks completed")
    
    except Exception as e:
        logger.error(f"Error running scheduled tasks: {e}")

def initialize_database():
    """Initialize the database with default values if empty."""
    try:
        # Import here to avoid circular imports
        from models import NetworkConfig, DexConfig, TokenConfig, FlashLoanConfig, WalletConfig, RiskConfig
        from config import DEFAULT_NETWORKS, DEFAULT_MIN_PROFIT_THRESHOLD, DEFAULT_MAX_SLIPPAGE, DEFAULT_MAX_GAS_COST, DEFAULT_MAX_EXPOSURE
        from config import BTC_DONATION_WALLET
        
        # Check if database is empty
        if BotStatus.query.count() == 0:
            logger.info("Initializing database with default values")
            
            # Create initial bot status
            bot_status = BotStatus(
                active=False,
                scan_count=0,
                successful_trades=0,
                failed_trades=0,
                timestamp=datetime.now(),
                last_scan=None
            )
            db.session.add(bot_status)
            
            # Create initial mining status
            mining_status = CloudMiningStatus(
                active=True,
                total_hash_power=0,
                active_workers=0,
                mining_revenue_24h=0,
                efficiency=0,
                total_profit=0,
                timestamp=datetime.now()
            )
            db.session.add(mining_status)
            
            # Create initial risk configuration
            risk_config = RiskConfig(
                min_profit_threshold=DEFAULT_MIN_PROFIT_THRESHOLD,
                max_slippage=DEFAULT_MAX_SLIPPAGE,
                max_gas_cost=DEFAULT_MAX_GAS_COST,
                max_exposure=DEFAULT_MAX_EXPOSURE,
                active=True
            )
            db.session.add(risk_config)
            
            # Add default network configurations
            network_map = {}  # Store network_name -> network_id mapping
            
            for network_data in DEFAULT_NETWORKS:
                network = NetworkConfig(
                    network_name=network_data['network_name'],
                    rpc_url=network_data['rpc_url'],
                    chain_id=network_data['chain_id'],
                    active=network_data['active'],
                    explorer_url=network_data['explorer_url']
                )
                db.session.add(network)
                db.session.flush()  # Generate an ID without committing
                
                network_map[network_data['network_name']] = network.id
            
            # Add default DEX configurations for each network
            for network_name, network_id in network_map.items():
                # Add Uniswap V2-like DEXes for each network
                if network_name == 'Ethereum':
                    db.session.add(DexConfig(
                        dex_name='Uniswap V2',
                        network_id=network_id,
                        router_address='0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
                        factory_address='0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f',
                        active=True,
                        version='v2'
                    ))
                    db.session.add(DexConfig(
                        dex_name='Sushiswap',
                        network_id=network_id,
                        router_address='0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F',
                        factory_address='0xC0AEe478e3658e2610c5F7A4A2E1777cE9e4f2Ac',
                        active=True,
                        version='v2'
                    ))
                elif network_name == 'BSC':
                    db.session.add(DexConfig(
                        dex_name='PancakeSwap',
                        network_id=network_id,
                        router_address='0x10ED43C718714eb63d5aA57B78B54704E256024E',
                        factory_address='0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73',
                        active=True,
                        version='v2'
                    ))
                elif network_name == 'Polygon':
                    db.session.add(DexConfig(
                        dex_name='QuickSwap',
                        network_id=network_id,
                        router_address='0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff',
                        factory_address='0x5757371414417b8C6CAad45bAeF941aBc7d3Ab32',
                        active=True,
                        version='v2'
                    ))
            
            # Add common tokens for each network
            for network_name, network_id in network_map.items():
                if network_name == 'Ethereum':
                    # Add ETH native token and common ERC20 tokens
                    db.session.add(TokenConfig(network_id=network_id, symbol='WETH', address='0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', decimals=18, active=True))
                    db.session.add(TokenConfig(network_id=network_id, symbol='USDT', address='0xdAC17F958D2ee523a2206206994597C13D831ec7', decimals=6, active=True))
                    db.session.add(TokenConfig(network_id=network_id, symbol='USDC', address='0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', decimals=6, active=True))
                    db.session.add(TokenConfig(network_id=network_id, symbol='DAI', address='0x6B175474E89094C44Da98b954EedeAC495271d0F', decimals=18, active=True))
                elif network_name == 'BSC':
                    # Add BNB native token and common BEP20 tokens
                    db.session.add(TokenConfig(network_id=network_id, symbol='WBNB', address='0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c', decimals=18, active=True))
                    db.session.add(TokenConfig(network_id=network_id, symbol='BUSD', address='0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56', decimals=18, active=True))
                    db.session.add(TokenConfig(network_id=network_id, symbol='USDT', address='0x55d398326f99059fF775485246999027B3197955', decimals=18, active=True))
                elif network_name == 'Polygon':
                    # Add MATIC native token and common tokens
                    db.session.add(TokenConfig(network_id=network_id, symbol='WMATIC', address='0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270', decimals=18, active=True))
                    db.session.add(TokenConfig(network_id=network_id, symbol='USDT', address='0xc2132D05D31c914a87C6611C10748AEb04B58e8F', decimals=6, active=True))
                    db.session.add(TokenConfig(network_id=network_id, symbol='USDC', address='0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', decimals=6, active=True))
            
            # Add flash loan configurations
            for network_name, network_id in network_map.items():
                if network_name == 'Ethereum':
                    db.session.add(FlashLoanConfig(
                        protocol='Aave V2',
                        network_id=network_id,
                        contract_address='0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9',
                        active=True
                    ))
                elif network_name == 'Polygon':
                    db.session.add(FlashLoanConfig(
                        protocol='Aave V2',
                        network_id=network_id,
                        contract_address='0x8dff5e27ea6b7ac08ebfdf9eb090f32ee9a30fcf',
                        active=True
                    ))
            
            # Add wallet configuration for donation
            if 'Ethereum' in network_map:
                db.session.add(WalletConfig(
                    name='ONG Caminhos da Luz',
                    address=BTC_DONATION_WALLET,  # BTC wallet address
                    network_id=network_map['Ethereum'],
                    percentage_share=5.0,  # 5% of profits to charity
                    active=True
                ))
            
            # Commit changes
            db.session.commit()
            
            logger.info("Database initialized with default values")
            return True
        
        return False
    
    except Exception as e:
        logger.error(f"Error initializing database: {e}")
        db.session.rollback()
        return False
