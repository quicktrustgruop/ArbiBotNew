import os
from datetime import datetime
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.dialects.postgresql import JSON

db = SQLAlchemy()

class ArbitrageOpportunity(db.Model):
    """
    Modelo para armazenar oportunidades de arbitragem detectadas
    """
    __tablename__ = 'arbitrage_opportunities'
    
    id = db.Column(db.Integer, primary_key=True)
    detected_at = db.Column(db.DateTime, default=datetime.utcnow)
    token_pair = db.Column(db.String(50), nullable=False)
    network = db.Column(db.String(50), nullable=False)
    buy_dex = db.Column(db.String(50), nullable=False)
    sell_dex = db.Column(db.String(50), nullable=False)
    price_diff_percentage = db.Column(db.Float, nullable=False)
    expected_profit_usd = db.Column(db.Float, nullable=False)
    estimated_gas_usd = db.Column(db.Float, nullable=False)
    loan_amount = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(20), default='detected')  # detected, executed, failed, ignored
    details = db.Column(JSON, nullable=True)
    
    def __repr__(self):
        return f"<ArbitrageOpportunity {self.id}: {self.token_pair} on {self.network}>"
    
    def to_dict(self):
        """Convert model to dictionary for API responses"""
        return {
            'id': self.id,
            'detected_at': self.detected_at.isoformat(),
            'token_pair': self.token_pair,
            'network': self.network,
            'buy_dex': self.buy_dex,
            'sell_dex': self.sell_dex,
            'price_diff_percentage': self.price_diff_percentage,
            'expected_profit_usd': self.expected_profit_usd,
            'estimated_gas_usd': self.estimated_gas_usd,
            'loan_amount': self.loan_amount,
            'status': self.status,
            'details': self.details
        }


class Transaction(db.Model):
    """
    Modelo para armazenar transações executadas
    """
    __tablename__ = 'transactions'
    
    id = db.Column(db.Integer, primary_key=True)
    opportunity_id = db.Column(db.Integer, db.ForeignKey('arbitrage_opportunities.id'), nullable=True)
    executed_at = db.Column(db.DateTime, default=datetime.utcnow)
    type = db.Column(db.String(50), nullable=False)  # Flash Loan Arbitrage, Rebalance, etc.
    status = db.Column(db.String(20), nullable=False)  # pending, completed, failed
    profit_usd = db.Column(db.Float, default=0.0)
    gas_cost_usd = db.Column(db.Float, default=0.0)
    tx_hash = db.Column(db.String(66), nullable=True)  # Ethereum tx hash is 66 chars with 0x prefix
    network = db.Column(db.String(50), nullable=False)
    details = db.Column(JSON, nullable=True)
    
    # Relação com a oportunidade
    opportunity = db.relationship('ArbitrageOpportunity', backref=db.backref('transactions', lazy=True))
    
    def __repr__(self):
        return f"<Transaction {self.id}: {self.type} - {self.status}>"
    
    def to_dict(self):
        """Convert model to dictionary for API responses"""
        return {
            'id': self.id,
            'opportunity_id': self.opportunity_id,
            'executed_at': self.executed_at.isoformat(),
            'type': self.type,
            'status': self.status,
            'profit_usd': self.profit_usd,
            'gas_cost_usd': self.gas_cost_usd,
            'tx_hash': self.tx_hash,
            'network': self.network,
            'details': self.details
        }


class BotConfig(db.Model):
    """
    Modelo para armazenar configurações do bot
    """
    __tablename__ = 'bot_config'
    
    id = db.Column(db.Integer, primary_key=True)
    key = db.Column(db.String(50), unique=True, nullable=False)
    value = db.Column(db.Text, nullable=True)
    value_type = db.Column(db.String(20), default='string')  # string, int, float, bool, json
    description = db.Column(db.String(200), nullable=True)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f"<BotConfig {self.key}: {self.value}>"


class AIModel(db.Model):
    """
    Enhanced AI Model with evolutionary capabilities
    """
    __tablename__ = 'ai_models'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    model_type = db.Column(db.String(50), nullable=False)  # prediction, optimization, evolution
    version = db.Column(db.String(20), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_trained = db.Column(db.DateTime, nullable=True)
    accuracy = db.Column(db.Float, nullable=True)
    parameters = db.Column(JSON, nullable=True)
    active = db.Column(db.Boolean, default=False)
    generation = db.Column(db.Integer, default=0)
    fitness_score = db.Column(db.Float, default=0.0)
    mutation_rate = db.Column(db.Float, default=0.01)
    adaptation_score = db.Column(db.Float, default=0.0)
    error_correction_rate = db.Column(db.Float, default=0.0)
    self_improvement_factor = db.Column(db.Float, default=1.0)
    
    def __repr__(self):
        return f"<AIModel {self.name} v{self.version}>"
    
    def to_dict(self):
        """Convert model to dictionary for API responses"""
        return {
            'id': self.id,
            'name': self.name,
            'model_type': self.model_type,
            'version': self.version,
            'created_at': self.created_at.isoformat(),
            'last_trained': self.last_trained.isoformat() if self.last_trained else None,
            'accuracy': self.accuracy,
            'parameters': self.parameters,
            'active': self.active
        }


class MarketData(db.Model):
    """
    Modelo para armazenar dados históricos de mercado para treinamento de IA
    """
    __tablename__ = 'market_data'
    
    id = db.Column(db.Integer, primary_key=True)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    token_symbol = db.Column(db.String(20), nullable=False)
    network = db.Column(db.String(50), nullable=False)
    dex = db.Column(db.String(50), nullable=False)
    price_usd = db.Column(db.Float, nullable=False)

class AIModelConfig(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    learning_rate = db.Column(db.Float, default=0.05)
    retraining_interval = db.Column(db.Integer, default=2)  # Days
    last_training = db.Column(db.DateTime)
    optimization_target = db.Column(db.String(50), default='max_profit')

    liquidity_usd = db.Column(db.Float, nullable=True)
    volume_24h_usd = db.Column(db.Float, nullable=True)
    additional_data = db.Column(JSON, nullable=True)
    
    def __repr__(self):
        return f"<MarketData {self.token_symbol} on {self.dex}: ${self.price_usd}>"