from app import db
from flask_login import UserMixin
from datetime import datetime
import json

class User(UserMixin, db.Model):
    """User model for authentication."""
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256))

class ArbitrageOpportunity(db.Model):
    """Model for storing arbitrage opportunities."""
    id = db.Column(db.Integer, primary_key=True)
    network = db.Column(db.String(50), nullable=False)
    token_pair = db.Column(db.String(20), nullable=False)
    buy_dex = db.Column(db.String(50), nullable=False)
    sell_dex = db.Column(db.String(50), nullable=False)
    price_difference_percent = db.Column(db.Float, nullable=False)
    expected_profit = db.Column(db.Float, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.now)
    status = db.Column(db.String(20), default="detected")
    
    def to_dict(self):
        """Convert the model to a dictionary."""
        return {
            'id': self.id,
            'network': self.network,
            'token_pair': self.token_pair,
            'buy_dex': self.buy_dex,
            'sell_dex': self.sell_dex,
            'price_difference_percent': self.price_difference_percent,
            'expected_profit': self.expected_profit,
            'timestamp': self.timestamp.isoformat(),
            'status': self.status
        }

class Transaction(db.Model):
    """Model for storing executed transactions."""
    id = db.Column(db.Integer, primary_key=True)
    network = db.Column(db.String(50), nullable=False)
    token_pair = db.Column(db.String(20), nullable=False)
    buy_dex = db.Column(db.String(50), nullable=False)
    sell_dex = db.Column(db.String(50), nullable=False)
    buy_amount = db.Column(db.Float, nullable=False)
    sell_amount = db.Column(db.Float, nullable=False)
    profit = db.Column(db.Float, nullable=False)
    gas_cost = db.Column(db.Float, nullable=False)
    net_profit = db.Column(db.Float, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.now)
    status = db.Column(db.String(20), nullable=False)
    tx_hash = db.Column(db.String(100))
    error_message = db.Column(db.Text)
    
    def to_dict(self):
        """Convert the model to a dictionary."""
        return {
            'id': self.id,
            'network': self.network,
            'token_pair': self.token_pair,
            'buy_dex': self.buy_dex,
            'sell_dex': self.sell_dex,
            'buy_amount': self.buy_amount,
            'sell_amount': self.sell_amount,
            'profit': self.profit,
            'gas_cost': self.gas_cost,
            'net_profit': self.net_profit,
            'timestamp': self.timestamp.isoformat(),
            'status': self.status,
            'tx_hash': self.tx_hash,
            'error_message': self.error_message
        }

class CloudMiningStatus(db.Model):
    """Model for storing cloud mining status."""
    id = db.Column(db.Integer, primary_key=True)
    active = db.Column(db.Boolean, default=True)
    total_hash_power = db.Column(db.Float, default=0)
    active_workers = db.Column(db.Integer, default=0)
    mining_revenue_24h = db.Column(db.Float, default=0)
    efficiency = db.Column(db.Float, default=0)
    total_profit = db.Column(db.Float, default=0)
    timestamp = db.Column(db.DateTime, default=datetime.now)
    
    def to_dict(self):
        """Convert the model to a dictionary."""
        return {
            'id': self.id,
            'active': self.active,
            'total_hash_power': self.total_hash_power,
            'active_workers': self.active_workers,
            'mining_revenue_24h': self.mining_revenue_24h,
            'efficiency': self.efficiency,
            'total_profit': self.total_profit,
            'timestamp': self.timestamp.isoformat()
        }

class BotStatus(db.Model):
    """Model for storing bot status."""
    id = db.Column(db.Integer, primary_key=True)
    active = db.Column(db.Boolean, default=False)
    scan_count = db.Column(db.Integer, default=0)
    successful_trades = db.Column(db.Integer, default=0)
    failed_trades = db.Column(db.Integer, default=0)
    timestamp = db.Column(db.DateTime, default=datetime.now)
    last_scan = db.Column(db.DateTime)
    
    def to_dict(self):
        """Convert the model to a dictionary."""
        return {
            'id': self.id,
            'active': self.active,
            'scan_count': self.scan_count,
            'successful_trades': self.successful_trades,
            'failed_trades': self.failed_trades,
            'timestamp': self.timestamp.isoformat(),
            'last_scan': self.last_scan.isoformat() if self.last_scan else None
        }

class NetworkConfig(db.Model):
    """Model for storing network configurations."""
    id = db.Column(db.Integer, primary_key=True)
    network_name = db.Column(db.String(50), unique=True, nullable=False)
    rpc_url = db.Column(db.String(255), nullable=False)
    chain_id = db.Column(db.Integer, nullable=False)
    active = db.Column(db.Boolean, default=True)
    explorer_url = db.Column(db.String(255))
    
    def to_dict(self):
        """Convert the model to a dictionary."""
        return {
            'id': self.id,
            'network_name': self.network_name,
            'rpc_url': self.rpc_url,
            'chain_id': self.chain_id,
            'active': self.active,
            'explorer_url': self.explorer_url
        }

class DexConfig(db.Model):
    """Model for storing DEX configurations."""
    id = db.Column(db.Integer, primary_key=True)
    dex_name = db.Column(db.String(50), nullable=False)
    network_id = db.Column(db.Integer, db.ForeignKey('network_config.id'), nullable=False)
    router_address = db.Column(db.String(42), nullable=False)
    factory_address = db.Column(db.String(42))
    active = db.Column(db.Boolean, default=True)
    version = db.Column(db.String(10))
    
    # Define relationship
    network = db.relationship('NetworkConfig', backref=db.backref('dexes', lazy=True))
    
    def to_dict(self):
        """Convert the model to a dictionary."""
        return {
            'id': self.id,
            'dex_name': self.dex_name,
            'network_id': self.network_id,
            'router_address': self.router_address,
            'factory_address': self.factory_address,
            'active': self.active,
            'version': self.version
        }

class TokenConfig(db.Model):
    """Model for storing token configurations."""
    id = db.Column(db.Integer, primary_key=True)
    network_id = db.Column(db.Integer, db.ForeignKey('network_config.id'), nullable=False)
    symbol = db.Column(db.String(20), nullable=False)
    address = db.Column(db.String(42), nullable=False)
    decimals = db.Column(db.Integer, default=18)
    active = db.Column(db.Boolean, default=True)
    
    # Define relationship
    network = db.relationship('NetworkConfig', backref=db.backref('tokens', lazy=True))
    
    def to_dict(self):
        """Convert the model to a dictionary."""
        return {
            'id': self.id,
            'network_id': self.network_id,
            'symbol': self.symbol,
            'address': self.address,
            'decimals': self.decimals,
            'active': self.active
        }

class FlashLoanConfig(db.Model):
    """Model for storing flash loan configurations."""
    id = db.Column(db.Integer, primary_key=True)
    protocol = db.Column(db.String(50), nullable=False)
    network_id = db.Column(db.Integer, db.ForeignKey('network_config.id'), nullable=False)
    contract_address = db.Column(db.String(42), nullable=False)
    active = db.Column(db.Boolean, default=True)
    
    # Define relationship
    network = db.relationship('NetworkConfig', backref=db.backref('flash_loan_protocols', lazy=True))
    
    def to_dict(self):
        """Convert the model to a dictionary."""
        return {
            'id': self.id,
            'protocol': self.protocol,
            'network_id': self.network_id,
            'contract_address': self.contract_address,
            'active': self.active
        }

class WalletConfig(db.Model):
    """Model for storing wallet configurations for profit distribution."""
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    address = db.Column(db.String(42), nullable=False)
    network_id = db.Column(db.Integer, db.ForeignKey('network_config.id'), nullable=False)
    percentage_share = db.Column(db.Float, default=100.0)
    active = db.Column(db.Boolean, default=True)
    
    # Define relationship
    network = db.relationship('NetworkConfig', backref=db.backref('wallets', lazy=True))
    
    def to_dict(self):
        """Convert the model to a dictionary."""
        return {
            'id': self.id,
            'name': self.name,
            'address': self.address,
            'network_id': self.network_id,
            'percentage_share': self.percentage_share,
            'active': self.active
        }

class RiskConfig(db.Model):
    """Model for storing risk management configurations."""
    id = db.Column(db.Integer, primary_key=True)
    min_profit_threshold = db.Column(db.Float, default=0.5)  # Minimum profit percentage
    max_slippage = db.Column(db.Float, default=3.0)  # Maximum allowed slippage percentage
    max_gas_cost = db.Column(db.Float, default=100.0)  # Maximum gas cost in USD
    max_exposure = db.Column(db.Float, default=1000.0)  # Maximum exposure in USD
    active = db.Column(db.Boolean, default=True)
    
    def to_dict(self):
        """Convert the model to a dictionary."""
        return {
            'id': self.id,
            'min_profit_threshold': self.min_profit_threshold,
            'max_slippage': self.max_slippage,
            'max_gas_cost': self.max_gas_cost,
            'max_exposure': self.max_exposure,
            'active': self.active
        }
